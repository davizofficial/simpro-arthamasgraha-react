import 'dotenv/config';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  if (isProduction) {
    throw new Error('JWT_SECRET wajib diisi pada NODE_ENV=production (lihat .env.example).');
  }

  jwtSecret = crypto.randomBytes(48).toString('hex');
  if (!isTest) {
    console.warn('[SIMPRO] JWT_SECRET belum diatur; memakai rahasia sementara. Salin .env.example menjadi .env.');
  }
}

const splitList = (value, fallback) => (value ? value.split(',') : fallback).map((v) => v.trim()).filter(Boolean);

export const BCRYPT_ROUNDS = 10;

export const config = {
  isProduction,
  isTest,
  port: Number(process.env.PORT) || 5000,
  dbPath: process.env.DB_PATH || path.join(__dirname, 'simpro.sqlite'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  cookieName: 'simpro_session',
  cookieMaxAgeMs: 8 * 60 * 60 * 1000,
  corsOrigins: splitList(process.env.CORS_ORIGINS, ['http://localhost:5173', 'http://127.0.0.1:5173']),

  simulatedLatencyMs: Number(process.env.SIMULATED_LATENCY_MS) || 0,
  loginRateLimit: {
    windowMs: Number(process.env.LOGIN_RATE_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.LOGIN_RATE_MAX) || 10,
  },
};
