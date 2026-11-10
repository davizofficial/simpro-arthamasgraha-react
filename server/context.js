import { AsyncLocalStorage } from 'async_hooks';

export const requestContext = new AsyncLocalStorage();

export const currentUser = () => requestContext.getStore()?.user ?? null;

export function createActivityHelpers(db) {
  const logActivity = (fallbackUser, action, target) => {
    try {
      const actor = currentUser()?.name || fallbackUser || 'Sistem';
      db.prepare('INSERT INTO activity_logs (user, action, target) VALUES (?, ?, ?)').run(actor, action, target ?? '');
    } catch (err) {
      console.error('[SIMPRO] Gagal mencatat aktivitas:', err.message);
    }
  };

  const pushNotification = (judul, pesan, tipe = 'info') => {
    try {
      db.prepare('INSERT INTO notifications (judul, pesan, tipe) VALUES (?, ?, ?)').run(judul, pesan, tipe);
    } catch (err) {
      console.error('[SIMPRO] Gagal membuat notifikasi:', err.message);
    }
  };

  const getUserPermissions = (roleName) => {
    const role = db.prepare('SELECT id FROM roles WHERE name = ?').get(roleName);
    if (!role) return [];
    return db
      .prepare(
        `SELECT p.name FROM permissions p
         JOIN role_has_permissions rhp ON p.id = rhp.permission_id
         WHERE rhp.role_id = ?`
      )
      .all(role.id)
      .map((r) => r.name);
  };

  return { logActivity, pushNotification, getUserPermissions };
}
