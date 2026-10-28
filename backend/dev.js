/**
 * Zero-setup local launcher.
 *
 *   node dev.js      (or: npm run dev:all)
 *
 * 1. Starts an in-memory MongoDB (no install needed).
 * 2. Runs the real seed script against it.
 * 3. Boots the Express API + serves the frontend — ALL on http://localhost:5000
 *
 * Just open http://localhost:5000 in your browser.
 * Demo login: demo@student.in / demo123
 */
const path = require('path');
const { spawn } = require('child_process');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = process.env.PORT || 5000;

function run(cmd, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: __dirname, env: { ...process.env, ...env }, stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${args.join(' ')} exited ${code}`))));
    child.on('error', reject);
  });
}

(async () => {
  console.log('⏳ starting in-memory MongoDB…');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('✅ mongo ready at', uri);

  console.log('⏳ seeding demo data…');
  await run(process.execPath, [path.join('src', 'seed', 'seed.js')], { MONGO_URI: uri, NODE_ENV: 'development' });

  // Configure env for this process, then boot the app.
  process.env.MONGO_URI = uri;
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || `http://localhost:${PORT}`;

  const { connectDB } = require('./src/config/db');
  await connectDB(uri);
  const app = require('./src/app');

  const server = app.listen(PORT, () => {
    console.log('\n══════════════════════════════════════════════');
    console.log(`  🎓 SSAP running →  http://localhost:${PORT}`);
    console.log('     demo  → demo@student.in / demo123');
    console.log('     admin → admin@ssap.in / admin123');
    console.log('══════════════════════════════════════════════\n');
  });

  const stop = async () => {
    console.log('\nshutting down…');
    server.close(async () => {
      const mongoose = require('mongoose');
      await mongoose.disconnect().catch(() => {});
      await mongod.stop().catch(() => {});
      process.exit(0);
    });
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})().catch((err) => {
  console.error('❌ dev launcher failed:', err.message);
  process.exit(1);
});
