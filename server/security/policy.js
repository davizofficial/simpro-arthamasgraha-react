import { authorize } from './auth.js';

const id = '[^/]+';
const rule = (method, path, access) => ({ method, regex: new RegExp(`^${path}/?$`), access });

export const routePolicy = [
  rule('GET', '/health', 'public'),
  rule('GET', '/settings', 'auth'),
  rule('PUT', '/settings', 'settings.edit'),

  rule('POST', '/auth/login', 'public'),
  rule('POST', '/auth/logout', 'public'),
  rule('GET', '/auth/me', 'auth'),
  rule('POST', '/auth/change-password', 'auth'),

  rule('GET', '/users', 'users.view'),
  rule('POST', '/users', 'users.create'),
  rule('PATCH', `/users/${id}/status`, 'users.edit'),

  rule('GET', '/dashboard', 'dashboard.view'),
  rule('GET', '/reports', 'reports.view'),
  rule('GET', '/activity-logs', 'reports.view'),

  rule('GET', '/(projects|proyek)', 'projects.view'),
  rule('GET', `/(projects|proyek)/${id}`, 'projects.view'),
  rule('POST', '/(projects|proyek)', 'projects.create'),

  rule('GET', '/clients', 'clients.view'),
  rule('POST', '/clients', 'clients.create'),
  rule('DELETE', `/clients/${id}`, 'clients.delete'),

  rule('GET', '/site-surveys', 'site-surveys.view'),
  rule('POST', '/site-surveys', 'site-surveys.create'),
  rule('PATCH', `/site-surveys/${id}/status`, 'site-surveys.approve'),

  rule('GET', '/progress', 'progress.view'),
  rule('POST', '/progress', 'progress.create'),
  rule('POST', `/proyek/${id}/laporan`, 'progress.create'),

  rule('GET', '/(materials|logistik/materials)', 'materials.view'),
  rule('POST', '/materials', 'materials.create'),
  rule('GET', '/material-requests', 'material_requests.view'),
  rule('POST', '/material-requests', 'material_requests.create'),
  rule('PATCH', `/material-requests/${id}/status`, 'material_requests.edit'),

  rule('GET', '/equipments', 'equipments.view'),
  rule('POST', '/equipments', 'equipments.create'),
  rule('PATCH', `/equipments/${id}/assign`, 'equipments.edit'),

  rule('GET', '/(finance|keuangan/kas)', 'finance.view'),
  rule('POST', '/finance/transactions', 'finance.create'),

  rule('GET', '/documents', 'documents.view'),
  rule('POST', '/documents', 'documents.create'),

  rule('GET', '/(notifications|notifikasi)', 'auth'),
  rule('PATCH', '/(notifications|notifikasi)/read-all', 'auth'),
  rule('PATCH', `/(notifications|notifikasi)/${id}/read`, 'auth'),
];

export const findPolicy = (method, path) => routePolicy.find((r) => r.method === method && r.regex.test(path));

export const createPolicyMiddleware = (authenticate) => (req, res, next) => {
  const policy = findPolicy(req.method, req.path);
  if (!policy) {
    return res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
  }
  req.routeAccess = policy.access;
  if (policy.access === 'public') return next();

  authenticate(req, res, (err) => {
    if (err) return next(err);
    if (policy.access === 'auth') return next();
    authorize(policy.access)(req, res, next);
  });
};
