import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { buildApp, loginAs } from './helpers.js';

let app;
let db;
let owner;
let pengawas;

beforeAll(async () => {
  ({ app, db } = buildApp());
  owner = await loginAs(app, 'owner');
  pengawas = await loginAs(app, 'pengawas');
});

const lastLog = () => db.prepare('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 1').get();

describe('Validasi input (zod)', () => {
  it('klien: menolak nama kosong & telepon tidak valid dengan pesan jelas', async () => {
    const res = await owner.post('/api/clients').send({ name: '', contact_person: 'Budi', phone: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThan(0);
  });

  it('klien: kategori di luar daftar ditolak', async () => {
    const res = await owner
      .post('/api/clients')
      .send({ name: 'PT Uji', category: 'Hacker', contact_person: 'Budi', phone: '0812-3456-7890' });
    expect(res.status).toBe(400);
  });

  it('klien valid tersimpan; field asing dibuang', async () => {
    const res = await owner.post('/api/clients').send({
      name: '  PT Uji Sukses  ',
      category: 'BUMN',
      contact_person: 'Ir. Budi',
      phone: '0812-3456-7890',
      email: 'a@b.co',
      is_admin: true,
    });
    expect(res.status).toBe(201);
    const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(res.body.data.id);
    expect(row.name).toBe('PT Uji Sukses');
    expect(row.is_admin).toBeUndefined();
  });

  it('progres: nilai di luar 0-100 ditolak', async () => {
    expect((await pengawas.post('/api/progress').send({ project_id: 1, progress: 150 })).status).toBe(400);
    expect((await pengawas.post('/api/progress').send({ project_id: 1, progress: -5 })).status).toBe(400);
  });

  it('transaksi kas: nominal negatif & kategori asing ditolak', async () => {
    expect(
      (await owner.post('/api/finance/transactions').send({ project_id: 1, category: 'material', amount: -1 })).status
    ).toBe(400);
    expect(
      (await owner.post('/api/finance/transactions').send({ project_id: 1, category: 'korupsi', amount: 100 })).status
    ).toBe(400);
  });

  it('SQL injection pada pencarian tidak merusak data (query terparameter)', async () => {
    const res = await owner.get('/api/clients').query({ search: "'; DROP TABLE clients; --" });
    expect(res.status).toBe(200);
    expect(db.prepare('SELECT count(*) c FROM clients').get().c).toBeGreaterThan(0);
  });

  it('JSON rusak -> 400, bukan 500', async () => {
    const res = await owner.post('/api/clients').set('Content-Type', 'application/json').send('{rusak');
    expect(res.status).toBe(400);
  });

  it('payload terlalu besar ditolak', async () => {
    const res = await owner.post('/api/clients').send({ name: 'x'.repeat(200_000) });
    expect(res.status).toBe(413);
  });
});

describe('Integritas audit trail (anti pemalsuan identitas)', () => {
  it('nama pelaku di log diambil dari token, bukan dari body', async () => {
    const res = await pengawas
      .post('/api/site-surveys')
      .send({ project_name: 'Uji Identitas', soil_type: 'Lempung', accessibility: 'Baik', user_name: 'Owner Palsu' });
    expect(res.status).toBe(201);
    expect(lastLog().user).toMatch(/Budi Prakoso/);
    expect(lastLog().user).not.toMatch(/Palsu/);
    const survey = db.prepare('SELECT user_name FROM site_surveys WHERE project_name = ?').get('Uji Identitas');
    expect(survey.user_name).toMatch(/Budi Prakoso/);
  });

  it('approved_by pada persetujuan material tidak bisa dipalsukan', async () => {
    const pending = db.prepare("SELECT id FROM material_requests WHERE status = 'pending' LIMIT 1").get();
    await owner
      .patch(`/api/material-requests/${pending.id}/status`)
      .send({ status: 'approved', approved_by: 'Presiden' });
    const row = db.prepare('SELECT approved_by FROM material_requests WHERE id = ?').get(pending.id);
    expect(row.approved_by).toBe('Owner / Direktur Utama');
  });
});

describe('Manajemen pengguna', () => {
  it('wajib kata sandi kuat; tersimpan sebagai hash', async () => {
    const weak = await owner
      .post('/api/users')
      .send({ name: 'Staf Baru', email: 'baru@x.co', role: 'pengawas', password: '123' });
    expect(weak.status).toBe(400);

    const ok = await owner
      .post('/api/users')
      .send({ name: 'Staf Baru', email: 'baru@x.co', role: 'pengawas', password: 'RahasiaKuat1' });
    expect(ok.status).toBe(201);
    const row = db.prepare('SELECT password FROM users WHERE email = ?').get('baru@x.co');
    expect(row.password).toMatch(/^\$2[aby]\$/);

    const login = await request(app).post('/api/auth/login').send({ username: 'baru', password: 'RahasiaKuat1' });
    expect(login.status).toBe(200);
  });

  it('role tak dikenal & duplikasi ditolak', async () => {
    const badRole = await owner
      .post('/api/users')
      .send({ name: 'X Y', email: 'x1@x.co', role: 'dewa', password: 'RahasiaKuat1' });
    expect(badRole.status).toBe(400);
    const dup = await owner
      .post('/api/users')
      .send({ name: 'X Y', email: 'owner@arthamasgraha.com', role: 'pengawas', password: 'RahasiaKuat1' });
    expect(dup.status).toBe(409);
  });

  it('tidak dapat menonaktifkan akun sendiri', async () => {
    const res = await owner.patch('/api/users/1/status').send({});
    expect(res.status).toBe(400);
  });
});

describe('Ketahanan server', () => {
  it('galat internal tidak membocorkan detail SQL', async () => {
    db.exec('ALTER TABLE clients RENAME TO clients_tmp');
    const res = await owner.get('/api/clients');
    db.exec('ALTER TABLE clients_tmp RENAME TO clients');
    expect(res.status).toBe(500);
    expect(res.body.error).not.toMatch(/sqlite|no such table|clients/i);
  });

  it('header keamanan (helmet) aktif dan X-Powered-By dimatikan', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('origin asing ditolak pada aksi tulis (CSRF defense-in-depth)', async () => {
    const res = await owner.post('/api/clients').set('Origin', 'http://evil.example').send({});
    expect(res.status).toBe(403);
  });
});
