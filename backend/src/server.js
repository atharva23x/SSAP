const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

async function main() {
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (sig) => {
    // eslint-disable-next-line no-console
    console.log(`[api] ${sig} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  try {
    await connectDB();

    // Auto-seed an empty database (first boot on a fresh deploy, e.g. Render + Atlas).
    if (env.NODE_ENV !== 'test') {
      try {
        const { seedIfEmpty } = require('./seed/seed');
        await seedIfEmpty();
      } catch (e) {
        console.error('[seed] auto-seed skipped:', e.message);
      }
    }

    if (env.CRON_ENABLED && env.NODE_ENV !== 'test') {
      const { startCron } = require('./cron/deadlines');
      startCron();
    }
  } catch (err) {
    console.error('[db] Warning: MongoDB connection failed on startup:');
    console.error(`     ${err.message}`);
    console.error('     Please set the MONGO_URI environment variable (e.g. from MongoDB Atlas).');
    console.error('     The server will remain active to serve static files and health checks.');
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[api] fatal:', err);
  process.exit(1);
});
