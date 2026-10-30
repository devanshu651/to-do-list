import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT) || 5000;
try {
  await connectDB();
  const server = app.listen(port, () => console.log(`Taskflow API listening on port ${port}`));
  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch {
  console.error(process.env.MONGODB_URI
    ? 'Unable to start API: MongoDB connection failed. Check Atlas credentials and network access in server/.env.'
    : 'Unable to start API: MONGODB_URI is empty. Add Atlas credentials in server/.env.');
  process.exit(1);
}
