import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp, loginAs } from './helpers.js';

let app;
let db;

beforeAll(() => {
  ({ app, db } = buildApp());
});

describe('Autentikasi', () => {
  it('menolak login tanpa kata sandi (bypass role-only tidak lagi mungkin)', async () => {
    const res = await request(app).post('/api/auth/login').send({ role: 'owner' });
    expect(res.status).toBe(400);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('menolak kata sandi salah dengan pesan generik (tanpa membocorkan sandi default)', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'owner', password: 'salah' });
    expect(res.status).toBe(401);
    expect(res.body.error).not.toMatch(/default|password/i);
  });

  it('pesan galat identik untuk user tidak ada vs sandi salah (anti user-enumeration)', async () => {
    const a = await request(app).post('/api/auth/login').send({ username: 'tidak-ada', password: 'x' });
    const b = await request(app).post('/api/auth/login').send({ username: 'owner', password: 'x' });
    expect(a.status).toBe(401);
    expect(a.body.error).toBe(b.body.error);
  });

  it('login sah menerbitkan cookie HttpOnly + SameSite=Strict dan TIDAK mengembalikan token di body', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'owner', password: 'password' });
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/simpro_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    expect(res.body.token).toBeUndefined();
    expect(res.body.user.permissions).toContain('dashboard.view');
    expect(res.body.user.password).toBeUndefined();
  });

  it('password tersimpan sebagai hash bcrypt, bukan plaintext', () => {
    const rows = db.prepare('SELECT password FROM users').all();
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((r) => expect(r.password).toMatch(/^\$2[aby]\$/));
  });

  it('akun nonaktif ditolak login', async () => {
    db.prepare("UPDATE users SET status = 'Nonaktif' WHERE username = 'marketing'").run();
    const res = await request(app).post('/api/auth/login').send({ username: 'marketing', password: 'password' });
    expect(res.status).toBe(403);
    db.prepare("UPDATE users SET status = 'Aktif' WHERE username = 'marketing'").run();
  });

  it('token palsu / dimanipulasi ditolak', async () => {
    const res = await request(app).get('/api/clients').set('Authorization', 'Bearer abc.def.ghi');
    expect(res.status).toBe(401);
  });

  it('akun yang dinonaktifkan langsung kehilangan akses meski token masih berlaku', async () => {
    const agent = await loginAs(app, 'logistik');
    expect((await agent.get('/api/materials')).status).toBe(200);
    db.prepare("UPDATE users SET status = 'Nonaktif' WHERE username = 'logistik'").run();
    expect((await agent.get('/api/materials')).status).toBe(401);
    db.prepare("UPDATE users SET status = 'Aktif' WHERE username = 'logistik'").run();
  });

  it('/auth/me mengembalikan profil sesi, logout menghapus cookie dan mencatat log', async () => {
    const agent = await loginAs(app, 'pengawas');
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.username).toBe('pengawas');

    const out = await agent.post('/api/auth/logout');
    expect(out.status).toBe(200);
    expect(out.headers['set-cookie'][0]).toMatch(/simpro_session=;/);

    const log = db.prepare("SELECT * FROM activity_logs WHERE action LIKE '%logout%' ORDER BY id DESC LIMIT 1").get();
    expect(log.user).toMatch(/Budi Prakoso/);
  });

  it('ganti kata sandi: validasi kekuatan & verifikasi sandi lama', async () => {
    const agent = await loginAs(app, 'keuangan');
    const weak = await agent
      .post('/api/auth/change-password')
      .send({ current_password: 'password', new_password: 'abc' });
    expect(weak.status).toBe(400);
    const wrong = await agent
      .post('/api/auth/change-password')
      .send({ current_password: 'bukan-sandi', new_password: 'SandiBaru123' });
    expect(wrong.status).toBe(400);
    const ok = await agent
      .post('/api/auth/change-password')
      .send({ current_password: 'password', new_password: 'SandiBaru123' });
    expect(ok.status).toBe(200);
    const relog = await request(app).post('/api/auth/login').send({ username: 'keuangan', password: 'SandiBaru123' });
    expect(relog.status).toBe(200);
  });
});
