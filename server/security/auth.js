import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { requestContext } from '../context.js';

export const signSessionToken = (user) =>
  jwt.sign({ sub: String(user.id), role: user.role }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn,
  });

export const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: config.isProduction,
  path: '/',
  maxAge: config.cookieMaxAgeMs,
});

export const setSessionCookie = (res, token) => res.cookie(config.cookieName, token, cookieOptions());

export const clearSessionCookie = (res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(config.cookieName, opts);
};

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[config.cookieName] || null;
};

export const resolveUser = (db, getUserPermissions, req) => {
  const token = extractToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    const row = db
      .prepare('SELECT id, name, username, email, role, role_label, avatar, status FROM users WHERE id = ?')
      .get(Number(payload.sub));
    if (!row || row.status !== 'Aktif') return null;
    const permissions = getUserPermissions(row.role);
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      role: row.role,
      roleLabel: row.role_label,
      avatar: row.avatar,
      status: row.status,
      permissions,
      can: (perm) => permissions.includes(perm),
    };
  } catch {
    return null;
  }
};

export const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  role: user.role,
  roleLabel: user.roleLabel,
  avatar: user.avatar,
  status: user.status,
  permissions: user.permissions,
});

export const createAuthenticate = (db, getUserPermissions) => (req, res, next) => {
  const user = resolveUser(db, getUserPermissions, req);
  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: 'Sesi tidak valid atau telah berakhir. Silakan login kembali.' });
  }
  req.user = user;
  requestContext.run({ user }, next);
};

export const authorize = (permission) => (req, res, next) => {
  if (!req.user?.can(permission)) {
    return res.status(403).json({
      success: false,
      error: `Akses ditolak. Anda tidak memiliki izin "${permission}".`,
    });
  }
  next();
};
