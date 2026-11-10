import Database from 'better-sqlite3';
import request from 'supertest';
import { expect } from 'vitest';
import { seedDatabase } from '../../server/seed.js';
import { createApp } from '../../server/app.js';

export function buildApp() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  seedDatabase(db);
  return { db, app: createApp(db) };
}

export async function loginAs(app, username, password = 'password') {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ username, password });
  expect(res.status, `login ${username}`).toBe(200);
  return agent;
}

export const ROLES = ['owner', 'admin', 'administrasi', 'konsultan', 'pengawas', 'logistik', 'marketing', 'keuangan'];
