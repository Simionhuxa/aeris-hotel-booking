import { db } from './db.js';
import { createApp } from './app.js';
const port = Number(process.env.PORT ?? 3001);
const server = createApp(db).listen(port, '127.0.0.1', () => console.log(`AERIS DEMO API: http://127.0.0.1:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { server.close(() => { void db.$disconnect().then(() => process.exit(0)); }); });
