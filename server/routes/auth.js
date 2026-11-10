import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { BCRYPT_ROUNDS, config } from '../config.js';
import { clearSessionCookie, publicUser, resolveUser, setSessionCookie, signSessionToken } from '../security/auth.js';
import { requestContext } from '../context.js';

const DUMMY_HASH = bcrypt.hashSync('simpro-dummy-password', BCRYPT_ROUNDS);

const INVALID_CREDENTIALS = 'Username atau kata sandi tidak valid.';

export default function registerAuth(app, { db, logActivity, getUserPermissions }) {
  const loginLimiter = rateLimit({
    windowMs: config.loginRateLimit.windowMs,
    max: config.loginRateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { success: false, error: 'Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.' },
  });

  app.post('/api/auth/login', loginLimiter, (req, res) => {
    const { username, email, password } = req.body;
    const identifier = String(username || email || '').trim();

    const user = db
      .prepare('SELECT * FROM users WHERE username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE')
      .get(identifier, identifier);

    const passwordOk = bcrypt.compareSync(password, user ? user.password : DUMMY_HASH);

    if (!user || !passwordOk) {
      return res.status(401).json({ success: false, error: INVALID_CREDENTIALS });
    }
    if (user.status !== 'Aktif') {
      return res.status(403).json({ success: false, error: 'Akun Anda dinonaktifkan oleh administrator' });
    }

    const permissions = getUserPermissions(user.role);
    requestContext.run({ user: { name: user.name } }, () =>
      logActivity(user.name, 'Melakukan login ke sistem SIMPRO', user.role_label)
    );

    setSessionCookie(res, signSessionToken(user));
    res.json({
      success: true,
      message: 'Login berhasil',
      user: publicUser({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        roleLabel: user.role_label,
        avatar: user.avatar,
        status: user.status,
        permissions,
      }),
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    const user = resolveUser(db, getUserPermissions, req);
    if (user) {
      requestContext.run({ user }, () => logActivity(user.name, 'Melakukan logout dari sistem SIMPRO', user.roleLabel));
    }
    clearSessionCookie(res);
    res.json({ success: true, message: 'Sesi berhasil diakhiri' });
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({ success: true, user: publicUser(req.user) });
  });

  app.post('/api/auth/change-password', (req, res) => {
    const { current_password, new_password } = req.body;
    const row = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    if (!row || !bcrypt.compareSync(current_password, row.password)) {
      return res.status(400).json({ success: false, error: 'Kata sandi saat ini tidak sesuai' });
    }
    if (current_password === new_password) {
      return res.status(400).json({ success: false, error: 'Kata sandi baru harus berbeda dari yang lama' });
    }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(
      bcrypt.hashSync(new_password, BCRYPT_ROUNDS),
      req.user.id
    );
    logActivity(req.user.name, 'Mengganti kata sandi akun', req.user.roleLabel);
    res.json({ success: true, message: 'Kata sandi berhasil diperbarui' });
  });
}
