import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp, Recipe } from '../backend/app.js';

dotenv.config({ path: fileURLToPath(new URL('../backend/.env', import.meta.url)) });

let dbConnection = null;

async function ensureDbConnected() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required.');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnection) {
    dbConnection = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
  }

  await dbConnection;
}

const expressApp = createApp(Recipe);

export default async function handler(req, res) {
  try {
    await ensureDbConnected();
    return expressApp(req, res);
  } catch (err) {
    console.error('Serverless connection error:', err);
    return res.status(500).json({
      message: 'Database connection failed: ' + err.message
    });
  }
}
