import express, { type ErrorRequestHandler, type RequestHandler } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Prisma, type PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { bookingSchema, contactSchema, credentials, dates, nights } from './validation.js';
import { hash, token, verifyPassword, passwordHash } from './security.js';

class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
const cookieName = 'aeris_admin';
const overlap = (checkIn: string, checkOut: string) => ({ status: 'CONFIRMED', checkIn: { lt: new Date(checkOut) }, checkOut: { gt: new Date(checkIn) } });
export function createApp(db: PrismaClient, origin = process.env.APP_ORIGIN ?? 'http://127.0.0.1:5173') {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use('/api', rateLimit({ windowMs: 60000, limit: 150, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'Too many requests. Try again shortly.' } }));
  app.use('/api', (req, _res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin && req.headers.origin !== origin) return next(new ApiError(403, 'Origin is not allowed.'));
    // Browser admin mutations must carry a same-origin header; prevents form-based CSRF.
    if (req.path.startsWith('/admin') && !['GET', 'HEAD'].includes(req.method) && req.headers['x-aeris-admin'] !== '1') return next(new ApiError(403, 'Admin request header required.'));
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  const sessionToken = (cookie = '') => {
    const value = cookie.split(';').map(v => v.trim()).find(v => v.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
    return value && /^[a-f0-9]{64}$/.test(value) ? value : '';
  };
  const admin: RequestHandler = async (req, _res, next) => {
    const value = sessionToken(req.headers.cookie);
    const session = value ? await db.adminSession.findUnique({ where: { tokenHash: hash(value) } }) : null;
    if (!session || session.expiresAt <= new Date()) throw new ApiError(401, 'Please sign in.');
    next();
  };
  app.get('/api/health', async (_req, res) => { await db.$queryRaw`SELECT 1`; res.json({ status: 'ok', demo: true }); });
  app.get('/api/rooms', async (_req, res) => res.json(await db.room.findMany({ orderBy: { priceCents: 'asc' } })));
  app.get('/api/availability', async (req, res) => {
    const range = dates.parse(req.query);
    const rooms = await db.room.findMany({ where: { bookings: { none: overlap(range.checkIn, range.checkOut) } }, orderBy: { priceCents: 'asc' } });
    res.json({ demo: true, rooms: rooms.map(room => ({ ...room, totalCents: room.priceCents * nights(range.checkIn, range.checkOut) })) });
  });
  app.post('/api/bookings', rateLimit({ windowMs: 60000, limit: 20, message: { error: 'Too many booking attempts.' } }), async (req, res) => {
    const { stay, guest } = bookingSchema.parse(req.body);
    const cancellationToken = token();
    // A row lock serializes pricing/capacity reads and reservations for this room.
    // The exclusion constraint also protects against writers outside this API.
    const booking = await db.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "Room" WHERE "id" = ${stay.roomId} FOR UPDATE`;
      const room = await tx.room.findUnique({ where: { id: stay.roomId } });
      if (!room) throw new ApiError(404, 'Room not found.');
      if (stay.adults + stay.children > room.capacity) throw new ApiError(400, `This room accommodates at most ${room.capacity} guests.`);
      if (await tx.booking.findFirst({ where: { roomId: room.id, ...overlap(stay.checkIn, stay.checkOut) } })) throw new ApiError(409, 'This room is no longer available for these dates. Choose another stay.');
      const { terms: _terms, ...details } = guest;
      return tx.booking.create({ data: {
        ...details, ...stay, checkIn: new Date(stay.checkIn), checkOut: new Date(stay.checkOut),
        reference: `DEMO-AER-${randomUUID().toUpperCase()}`, cancellationHash: hash(cancellationToken),
        nightlyCents: room.priceCents, totalCents: room.priceCents * nights(stay.checkIn, stay.checkOut), demo: true,
      }, select: { reference: true, totalCents: true, nightlyCents: true, currency: true, status: true, demo: true } });
    }, { maxWait: 10000, timeout: 15000 });
    res.status(201).json({ ...booking, cancellationToken });
  });
  app.post('/api/bookings/:reference/cancel', async (req, res) => {
    const body = z.object({ cancellationToken: z.string().regex(/^[a-f0-9]{64}$/) }).parse(req.body);
    const result = await db.booking.updateMany({ where: { reference: req.params.reference as string, cancellationHash: hash(body.cancellationToken) }, data: { status: 'CANCELLED' } });
    if (!result.count) throw new ApiError(404, 'Booking or cancellation token not found.');
    res.json({ status: 'CANCELLED', demo: true });
  });
  app.post('/api/contact', rateLimit({ windowMs: 60000, limit: 10, message: { error: 'Too many messages. Try again shortly.' } }), async (req, res) => {
    const { privacy: _privacy, ...data } = contactSchema.parse(req.body);
    await db.contactMessage.create({ data: { ...data, demo: true } });
    res.status(201).json({ demo: true, message: 'DEMO message saved. No email was sent.' });
  });
  const cookieOptions = { httpOnly: true, sameSite: 'strict' as const, secure: process.env.NODE_ENV === 'production', path: '/api/admin' };
  // Equal password work for unknown accounts prevents the obvious timing shortcut.
  const dummyHash = passwordHash(token());
  app.post('/api/admin/login', rateLimit({ windowMs: 15 * 60000, limit: 10, message: { error: 'Too many sign-in attempts. Try again later.' } }), async (req, res) => {
    const body = credentials.parse(req.body);
    const account = await db.admin.findUnique({ where: { email: body.email } });
    const valid = verifyPassword(body.password, account?.passwordHash ?? dummyHash);
    if (!account || !valid) throw new ApiError(401, 'Invalid email or password.');
    const value = token();
    await db.adminSession.deleteMany({ where: { OR: [{ expiresAt: { lt: new Date() } }, { tokenHash: hash(sessionToken(req.headers.cookie)) }] } });
    await db.adminSession.create({ data: { tokenHash: hash(value), adminId: account.id, expiresAt: new Date(Date.now() + 8 * 3600000) } });
    res.cookie(cookieName, value, { ...cookieOptions, maxAge: 8 * 3600000 }).json({ email: account.email });
  });
  app.get('/api/admin/session', admin, (_req, res) => res.json({ authenticated: true }));
  app.post('/api/admin/logout', async (req, res) => {
    await db.adminSession.deleteMany({ where: { tokenHash: hash(sessionToken(req.headers.cookie)) } });
    res.clearCookie(cookieName, cookieOptions).json({ ok: true });
  });
  app.get('/api/admin/bookings', admin, async (req, res) => {
    const filters = z.object({ status: z.enum(['CONFIRMED', 'CANCELLED']).optional(), q: z.string().max(100).optional(), page: z.coerce.number().int().min(1).max(100000).default(1) }).parse(req.query);
    const where: Prisma.BookingWhereInput = { status: filters.status, ...(filters.q ? { OR: [{ reference: { contains: filters.q, mode: 'insensitive' } }, { email: { contains: filters.q, mode: 'insensitive' } }, { lastName: { contains: filters.q, mode: 'insensitive' } }] } : {}) };
    const [items, count] = await Promise.all([db.booking.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (filters.page - 1) * 50, take: 50, omit: { cancellationHash: true } }), db.booking.count({ where })]);
    res.json({ items, count });
  });
  app.post('/api/admin/bookings/:reference/cancel', admin, async (req, res) => {
    const result = await db.booking.updateMany({ where: { reference: req.params.reference as string }, data: { status: 'CANCELLED' } });
    if (!result.count) throw new ApiError(404, 'Booking not found.');
    res.json({ status: 'CANCELLED', demo: true });
  });
  app.get('/api/admin/messages', admin, async (req, res) => {
    const page = z.coerce.number().int().min(1).max(100000).default(1).parse(req.query.page);
    const [items, count] = await Promise.all([db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * 50, take: 50 }), db.contactMessage.count()]);
    res.json({ items, count });
  });
  app.use('/api', (_req, _res, next) => next(new ApiError(404, 'Endpoint not found.')));
  const errors: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) { res.status(400).json({ error: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ') }); return; }
    if (error instanceof ApiError) { res.status(error.status).json({ error: error.message }); return; }
    if (error instanceof SyntaxError && 'body' in error) { res.status(400).json({ error: 'Invalid JSON.' }); return; }
    if (error.type === 'entity.too.large') { res.status(413).json({ error: 'Request too large.' }); return; }
    if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2004' || error.code === 'P2010') && JSON.stringify(error.meta).includes('booking_no_overlap')) { res.status(409).json({ error: 'Room is no longer available.' }); return; }
    console.error('API request failed:', error.code ?? error.name ?? 'Unknown error');
    res.status(500).json({ error: 'Unable to complete the request. Please try again.' });
  };
  app.use(errors);
  return app;
}
