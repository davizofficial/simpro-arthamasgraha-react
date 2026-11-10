import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { routePolicy } from '../../server/security/policy.js';
import { buildApp, loginAs, ROLES } from './helpers.js';

let app;
let db;
const agents = {};

beforeAll(async () => {
  ({ app, db } = buildApp());
  for (const role of ROLES) agents[role] = await loginAs(app, role);
});

describe('Default-deny: semua rute terlindungi wajib login', () => {
  const protectedRules = routePolicy.filter((r) => r.access !== 'public');

  it.each(protectedRules.map((r) => [r.method, r.regex.source]))('%s %s tanpa sesi -> 401', async (method, source) => {
    const path = source
      .replace(/\\\//g, '/')
      .replace(/^\^/, '')
      .replace(/\/\?\$$/, '')
      .replace(/\[\^\/\]\+/g, '1')
      .replace(/\(([^|)]+)\|[^)]+\)/g, '$1');
    const res = await request(app)[method.toLowerCase()](`/api${path}`).send({});
    expect(res.status, `${method} /api${path}`).toBe(401);
  });

  it('endpoint tak terdaftar -> 404, bukan lolos', async () => {
    expect((await agents.owner.get('/api/rute-rahasia')).status).toBe(404);
    expect((await request(app).get('/api/rute-rahasia')).status).toBe(404);
  });
});

describe('Matriks RBAC (otorisasi diverifikasi di server)', () => {
  const cases = [
    ['pengawas', 'delete', '/api/clients/1', undefined, 403],
    ['logistik', 'get', '/api/finance', undefined, 403],
    ['pengawas', 'get', '/api/finance', undefined, 403],
    ['keuangan', 'get', '/api/finance', undefined, 200],
    ['owner', 'get', '/api/finance', undefined, 200],
    ['pengawas', 'get', '/api/users', undefined, 403],
    ['admin', 'get', '/api/users', undefined, 200],
    ['marketing', 'get', '/api/clients', undefined, 200],
    ['logistik', 'get', '/api/clients', undefined, 403],
    ['pengawas', 'put', '/api/settings', { company_name: 'X' }, 403],
    ['owner', 'put', '/api/settings', { company_name: 'CV. Arthamas Graha' }, 200],
    ['pengawas', 'patch', '/api/site-surveys/1/status', { status: 'approved' }, 403],
    ['owner', 'patch', '/api/site-surveys/1/status', { status: 'review', reviewer_notes: 'Perlu uji tambahan' }, 200],
    ['pengawas', 'get', '/api/reports', undefined, 200],
    ['marketing', 'get', '/api/materials', undefined, 403],
    ['logistik', 'get', '/api/equipments', undefined, 200],
    ['konsultan', 'post', '/api/equipments', { name: 'Crane', daily_cost: 1000000 }, 403],
  ];

  it.each(cases)('%s %s %s -> %i', async (role, method, path, body, expected) => {
    const res = await agents[role][method](path).send(body);
    expect(res.status).toBe(expected);
  });

  it('pengawas tidak dapat menyetujui pengajuan material, owner dapat', async () => {
    const pending = db.prepare("SELECT id FROM material_requests WHERE status = 'pending' LIMIT 1").get();
    const denied = await agents.pengawas
      .patch(`/api/material-requests/${pending.id}/status`)
      .send({ status: 'approved' });
    expect(denied.status).toBe(403);
    const ok = await agents.owner.patch(`/api/material-requests/${pending.id}/status`).send({ status: 'approved' });
    expect(ok.status).toBe(200);
  });

  it('pengajuan yang sudah dikirim tidak dapat diubah lagi', async () => {
    const item = db.prepare('SELECT id FROM material_requests LIMIT 1').get();
    db.prepare("UPDATE material_requests SET status = 'delivered' WHERE id = ?").run(item.id);
    const res = await agents.owner.patch(`/api/material-requests/${item.id}/status`).send({ status: 'pending' });
    expect(res.status).toBe(409);
  });

  it('dashboard: data keuangan & log staf diredaksi bagi peran tanpa finance.view', async () => {
    const lowRole = (await agents.pengawas.get('/api/dashboard')).body.data;
    expect(lowRole.stats.total_budget).toBe(0);
    expect(lowRole.stats.total_spent).toBe(0);
    expect(lowRole.categoriesData).toEqual([]);
    expect(lowRole.recentActivities).toEqual([]);
    expect(lowRole.projects.every((p) => p.budget === 0 && p.spent === 0)).toBe(true);

    const exec = (await agents.owner.get('/api/dashboard')).body.data;
    expect(exec.stats.total_budget).toBeGreaterThan(0);
    expect(exec.recentActivities.length).toBeGreaterThan(0);
  });
});
