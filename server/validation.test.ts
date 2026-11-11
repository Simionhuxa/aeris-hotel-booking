import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bookingSchema, contactSchema, dates, nights } from './validation.js';
import { passwordHash, verifyPassword } from './security.js';
const stay = { roomId: 'forest-suite', checkIn: '2090-03-27', checkOut: '2090-03-30', adults: 2, children: 0 };
const guest = { firstName: 'Demo', lastName: 'Guest', email: 'demo@example.com', phone: '', country: 'Ukraine', note: '', terms: true };
test('calendar nights and integer pricing are stable across DST', () => { assert.equal(nights(stay.checkIn, stay.checkOut), 3); assert.equal(nights(stay.checkIn, stay.checkOut) * 18500, 55500); });
test('server rejects malformed dates, past dates and stays over 30 nights', () => {
  for (const range of [{ checkIn: '2090-02-30', checkOut: '2090-03-02' }, { checkIn: '2020-01-01', checkOut: '2020-01-02' }, { checkIn: stay.checkIn, checkOut: stay.checkIn }, { checkIn: stay.checkIn, checkOut: '2090-06-01' }]) assert.equal(dates.safeParse(range).success, false);
});
test('server validates guest counts, consent, bounded text and ignores client price', () => {
  for (const change of [{ adults: 0 }, { adults: 1.5 }, { children: -1 }]) assert.equal(bookingSchema.safeParse({ stay: { ...stay, ...change }, guest }).success, false);
  assert.equal(bookingSchema.safeParse({ stay, guest: { ...guest, terms: false } }).success, false);
  assert.equal(bookingSchema.safeParse({ stay, guest: { ...guest, email: 'wrong' } }).success, false);
  assert.equal(bookingSchema.safeParse({ stay, guest: { ...guest, note: 'a'.repeat(2001) } }).success, false);
  assert.equal('totalCents' in bookingSchema.parse({ stay, guest, totalCents: 1 }), false);
});
test('contact requires privacy consent and valid email', () => {
  const body = { firstName: 'Demo', lastName: 'Guest', email: 'demo@example.com', topic: 'Simply a hello', message: 'DEMO hello', privacy: true };
  assert.equal(contactSchema.safeParse(body).success, true);
  assert.equal(contactSchema.safeParse({ ...body, privacy: false }).success, false);
  assert.equal(contactSchema.safeParse({ ...body, message: ' ' }).success, false);
});
test('admin passwords are salted and verified', () => {
  const value = passwordHash('demo-password-123'); assert.notEqual(value, passwordHash('demo-password-123'));
  assert.equal(verifyPassword('demo-password-123', value), true); assert.equal(verifyPassword('wrong', value), false);
});
