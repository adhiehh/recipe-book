import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { createApp } from './app.js';

// Load environment variables from backend/.env
dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

const mongoUri = process.env.MONGODB_URI;
const serverPort = process.env.PORT || 5000;

if (!mongoUri || mongoUri.includes('YOUR_CLUSTER')) {
  console.error('CRITICAL: MONGODB_URI is missing or contains placeholder values in backend/.env.');
  process.exit(1);
}

async function startServer() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    console.log('Database connected successfully.');

    const app = createApp();
    const serverInstance = app.listen(serverPort, '0.0.0.0', () => {
      console.log(`Recipe Book API server active on port ${serverPort}`);
    });

    const gracefulShutdown = async (signalName) => {
      console.log(`Received ${signalName}. Initiating graceful shutdown...`);
      serverInstance.close(async () => {
        await mongoose.disconnect();
        console.log('Database connection closed. Process exited safely.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (connectionError) {
    console.error('Failed to establish database connection:', connectionError.message);
    process.exit(1);
  }
}

startServer();
