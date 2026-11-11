import 'dotenv/config';
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { createApp } from './app.js';
import { passwordHash } from './security.js';
const url = process.env.TEST_DATABASE_URL;
if (!url || !['localhost', '127.0.0.1'].includes(new URL(url).hostname) || !new URL(url).pathname.endsWith('_test')) throw new Error('TEST_DATABASE_URL must target a dedicated local database ending in _test. Apply migrations first.');
const db = new PrismaClient({ datasourceUrl: url });
const tag = randomUUID();
const roomId = `test-${tag}`;
const email = `${tag}@example.com`;
const guest = { firstName: 'Demo', lastName: 'Guest', email, phone: '', country: 'Ukraine', note: '', terms: true };
const stay = { roomId, checkIn: '2090-06-10', checkOut: '2090-06-13', adults: 2, children: 0 };
const origin = 'http://127.0.0.1:5173';
const app = createApp(db, origin);
const authHeader = { 'X-Aeris-Admin': '1', Origin: origin };
describe('PostgreSQL API integration', { concurrency: false }, () => {
  before(async () => {
    await db.room.create({ data: { id: roomId, name: 'DEMO test room', capacity: 2, area: 38, priceCents: 18500 } });
    await db.admin.create({ data: { email, passwordHash: passwordHash('test-password-123') } });
  });
  after(async () => {
    await db.booking.deleteMany({ where: { roomId } });
    await db.room.deleteMany({ where: { id: roomId } });
    await db.contactMessage.deleteMany({ where: { email } });
    await db.admin.deleteMany({ where: { email } });
    await db.$disconnect();
  });
  test('rooms, availability, invalid input and safe API errors', async () => {
    await request(app).get('/api/health').expect(200);
    const rooms = await request(app).get('/api/rooms').expect(200); assert.ok(rooms.body.some((room: { id: string }) => room.id === roomId));
    await request(app).get('/api/availability?checkIn=invalid&checkOut=2090-06-13').expect(400);
    await request(app).post('/api/bookings').send({ stay: { ...stay, adults: 3 }, guest }).expect(400);
    await request(app).post('/api/bookings').send({ stay: { ...stay, roomId: 'missing-room' }, guest }).expect(404);
    await request(app).post('/api/bookings').send({ stay, guest: { ...guest, terms: false } }).expect(400);
    await request(app).post('/api/bookings').set('Content-Type', 'application/json').send('{').expect(400);
    await request(app).get('/api/unknown').expect(404);
    await request(app).post('/api/contact').set('Origin', 'https://evil.example').send({}).expect(403);
  });
  test('concurrent requests across two app instances produce one booking; cancellation releases inventory', async () => {
    const secondApp = createApp(db, origin);
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => request(i % 2 ? app : secondApp).post('/api/bookings').send({ stay, guest, totalCents: 1, demo: false })));
    assert.equal(results.filter(result => result.status === 201).length, 1, JSON.stringify(results.map(result => ({ status: result.status, body: result.body }))));
    assert.equal(results.filter(result => result.status === 409).length, 7);
    const created = results.find(result => result.status === 201)!.body;
    assert.equal(created.totalCents, 55500); assert.equal(created.nightlyCents, 18500); assert.equal(created.demo, true); assert.match(created.reference, /^DEMO-AER-/);
    const saved = await db.booking.findUniqueOrThrow({ where: { reference: created.reference } });
    assert.notEqual(saved.cancellationHash, created.cancellationToken);
    assert.equal(await db.booking.count({ where: { roomId, status: 'CONFIRMED' } }), 1);
    const available = await request(app).get('/api/availability?checkIn=2090-06-10&checkOut=2090-06-13').expect(200);
    assert.equal(available.body.rooms.some((room: { id: string }) => room.id === roomId), false);
    // Direct writes must also respect the exclusion constraint.
    await assert.rejects(db.booking.create({ data: { ...saved, id: randomUUID(), reference: `DEMO-DIRECT-${tag}` } }));
    // Adjacent check-in on checkout day is allowed.
    await request(app).post('/api/bookings').send({ stay: { ...stay, checkIn: stay.checkOut, checkOut: '2090-06-14' }, guest }).expect(201);
    await request(app).post(`/api/bookings/${created.reference}/cancel`).send({ cancellationToken: 'a'.repeat(64) }).expect(404);
    await request(app).post(`/api/bookings/${created.reference}/cancel`).send({ cancellationToken: created.cancellationToken }).expect(200);
    await request(app).post(`/api/bookings/${created.reference}/cancel`).send({ cancellationToken: created.cancellationToken }).expect(200);
    const replacement = await request(app).post('/api/bookings').send({ stay, guest }).expect(201);
    assert.notEqual(replacement.body.reference, created.reference);
  });
  test('contact persistence, secure login, filters, admin cancellation, expiry and logout', async () => {
    await request(app).post('/api/contact').send({ firstName: 'Demo', lastName: 'Guest', email, topic: 'Simply a hello', message: 'DEMO test note', privacy: false }).expect(400);
    await request(app).post('/api/contact').send({ firstName: 'Demo', lastName: 'Guest', email, topic: 'Simply a hello', message: 'DEMO test note', privacy: true }).expect(201);
    const client = request.agent(app);
    await client.get('/api/admin/bookings').expect(401); await client.get('/api/admin/messages').expect(401);
    await client.post('/api/admin/login').send({ email, password: 'test-password-123' }).expect(403);
    await client.post('/api/admin/login').set(authHeader).send({ email, password: 'wrong' }).expect(401);
    const login = await client.post('/api/admin/login').set(authHeader).send({ email, password: 'test-password-123' }).expect(200);
    assert.match(login.headers['set-cookie'][0], /HttpOnly/); assert.match(login.headers['set-cookie'][0], /SameSite=Strict/);
    await client.get('/api/admin/session').expect(200);
    const bookings = await client.get(`/api/admin/bookings?status=CONFIRMED&q=${email}`).expect(200);
    assert.equal(bookings.body.count, 2); assert.equal('cancellationHash' in bookings.body.items[0], false);
    const reference = bookings.body.items[0].reference;
    await request(app).post(`/api/admin/bookings/${reference}/cancel`).set(authHeader).expect(401);
    await client.post(`/api/admin/bookings/${reference}/cancel`).set({ ...authHeader, Origin: 'https://evil.example' }).expect(403);
    await client.post(`/api/admin/bookings/${reference}/cancel`).set(authHeader).expect(200);
    const messages = await client.get('/api/admin/messages').expect(200); assert.ok(messages.body.items.some((message: { email: string }) => message.email === email));
    await client.post('/api/admin/logout').set(authHeader).expect(200); await client.get('/api/admin/bookings').expect(401);
    await client.post('/api/admin/login').set(authHeader).send({ email, password: 'test-password-123' }).expect(200);
    const account = await db.admin.findUniqueOrThrow({ where: { email } });
    await db.adminSession.updateMany({ where: { adminId: account.id }, data: { expiresAt: new Date(0) } });
    await client.get('/api/admin/messages').expect(401);
  });
});
