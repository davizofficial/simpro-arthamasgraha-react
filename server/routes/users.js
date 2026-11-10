import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config.js';

export default function registerUsers(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/users', (req, res) => {
    try {
      const users = db
        .prepare(
          'SELECT id, name, username, email, role, role_label as roleLabel, avatar, status FROM users ORDER BY id ASC'
        )
        .all();

      const usersWithPerms = users.map((u) => ({
        ...u,
        permissions: getUserPermissions(u.role),
      }));
      res.json({ success: true, data: usersWithPerms });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/users', (req, res) => {
    const { name, username, email, role, roleLabel, password } = req.body;
    if (!name || !email || !role || !password) {
      return res.status(400).json({ success: false, error: 'Nama, email, role, dan kata sandi wajib diisi' });
    }
    try {
      const roleRow = db.prepare('SELECT label FROM roles WHERE name = ?').get(role);
      if (!roleRow) return res.status(400).json({ success: false, error: 'Role tidak dikenal' });
      const duplicate = db
        .prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE')
        .get(username || email.split('@')[0], email);
      if (duplicate) return res.status(409).json({ success: false, error: 'Username atau email sudah terdaftar' });
      const avatar = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      const uname = username || email.split('@')[0];
      const stmt = db.prepare(`
        INSERT INTO users (name, username, email, password, role, role_label, avatar, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif')
      `);
      const info = stmt.run(
        name,
        uname,
        email,
        bcrypt.hashSync(password, BCRYPT_ROUNDS),
        role,
        roleLabel || roleRow.label || role.toUpperCase(),
        avatar
      );
      logActivity('Admin Sistem', 'Mendaftarkan pengguna baru ke database', name);
      res.status(201).json({
        success: true,
        message: 'Pengguna baru berhasil didaftarkan!',
        data: { id: info.lastInsertRowid, name, username: uname, email, role, roleLabel, avatar, status: 'Aktif' },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.patch('/api/users/:id/status', (req, res) => {
    const { id } = req.params;
    try {
      const user = db.prepare('SELECT id, name, status FROM users WHERE id = ?').get(id);
      if (!user) return res.status(404).json({ success: false, error: 'User tidak ditemukan' });
      if (req.user && Number(req.user.id) === Number(user.id)) {
        return res.status(400).json({ success: false, error: 'Anda tidak dapat menonaktifkan akun Anda sendiri' });
      }

      const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
      db.prepare('UPDATE users SET status = ? WHERE id = ?').run(newStatus, id);
      logActivity('Admin Sistem', `Mengubah status user ${user.name} menjadi ${newStatus}`, `ID #${id}`);

      res.json({ success: true, message: `Status pengguna berhasil diubah menjadi ${newStatus}`, status: newStatus });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
