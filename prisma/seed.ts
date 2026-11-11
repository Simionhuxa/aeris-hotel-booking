import { db } from '../server/db.js';
import { passwordHash } from '../server/security.js';
try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) before seeding.');
  for (const room of [{ id: 'forest-suite', name: 'Forest Suite', capacity: 2, area: 38, priceCents: 18500 }, { id: 'panorama-loft', name: 'Panorama Loft', capacity: 2, area: 52, priceCents: 27500 }, { id: 'summit-residence', name: 'Summit Residence', capacity: 4, area: 86, priceCents: 42000 }]) {
    await db.room.upsert({ where: { id: room.id }, create: room, update: {} });
  }
  await db.admin.upsert({ where: { email }, create: { email, passwordHash: passwordHash(password) }, update: { passwordHash: passwordHash(password) } });
  console.log('DEMO rooms and admin seeded.');
} finally { await db.$disconnect(); }
