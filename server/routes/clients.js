export default function registerClients(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get('/api/clients', (req, res) => {
    const { search = '', category = 'semua' } = req.query;
    try {
      let query = 'SELECT * FROM clients WHERE 1=1';
      const params = [];

      if (category && category !== 'semua') {
        query += ' AND LOWER(category) = LOWER(?)';
        params.push(category);
      }

      if (search.trim()) {
        query += ' AND (name LIKE ? OR company LIKE ? OR contact_person LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      query += ' ORDER BY id ASC';
      const clients = db.prepare(query).all(...params);
      res.json({ success: true, count: clients.length, data: clients });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/clients', (req, res) => {
    const { name, company, category, contact_person, phone, email, address, created_by } = req.body;
    if (!name || !contact_person || !phone) {
      return res.status(400).json({ success: false, error: 'Nama klien, PIC, dan nomor telepon wajib diisi' });
    }
    try {
      const stmt = db.prepare(`
        INSERT INTO clients (name, company, category, contact_person, phone, email, address, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif')
      `);
      const info = stmt.run(
        name,
        company || name,
        category || 'Swasta',
        contact_person,
        phone,
        email || '',
        address || ''
      );
      const clientName = name.trim();
      logActivity(
        created_by || 'Marketing & Klien',
        `Mendaftarkan mitra klien baru: ${clientName}`,
        `${category || 'Swasta'} • PIC: ${contact_person}`
      );
      res.status(201).json({
        success: true,
        message: 'Klien baru berhasil ditambahkan ke database!',
        data: {
          id: info.lastInsertRowid,
          name: clientName,
          company: company || clientName,
          category: category || 'Swasta',
          contact_person,
          phone,
          email: email || '',
          address: address || '',
          status: 'Aktif',
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    try {
      const client = db.prepare('SELECT name FROM clients WHERE id = ?').get(id);
      if (!client) return res.status(404).json({ success: false, error: 'Klien tidak ditemukan' });

      db.prepare('DELETE FROM clients WHERE id = ?').run(id);
      logActivity('Admin Sistem', `Menghapus data klien: ${client.name}`, `ID #${id}`);
      res.json({ success: true, message: `Klien ${client.name} berhasil dihapus!` });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
