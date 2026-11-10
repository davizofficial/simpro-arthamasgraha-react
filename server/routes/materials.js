export default function registerMaterials(app, { db, logActivity, pushNotification, getUserPermissions }) {
  app.get(['/api/materials', '/api/logistik/materials'], (req, res) => {
    const { search = '', low_stock } = req.query;
    try {
      let query = 'SELECT * FROM materials WHERE 1=1';
      const params = [];

      if (low_stock === 'true') {
        query += ' AND stock <= minimum_stock';
      }

      if (search.trim()) {
        query += ' AND (name LIKE ? OR code LIKE ? OR supplier LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }

      query += ' ORDER BY id ASC';
      const materials = db.prepare(query).all(...params);
      res.json({ success: true, count: materials.length, data: materials });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/materials', (req, res) => {
    const { name, stock, unit, minimum_stock, price_per_unit, specification, supplier } = req.body;
    if (!name || !unit || !price_per_unit) {
      return res.status(400).json({ success: false, error: 'Nama material, satuan, dan harga per unit wajib diisi' });
    }
    try {
      const count = db.prepare('SELECT count(*) as c FROM materials').get().c;
      const code = `MAT-${(count + 1).toString().padStart(3, '0')}`;
      const stmt = db.prepare(`
        INSERT INTO materials (code, name, stock, unit, minimum_stock, price_per_unit, specification, supplier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        code,
        name,
        parseInt(stock) || 0,
        unit,
        parseInt(minimum_stock) || 100,
        parseFloat(price_per_unit),
        specification || 'SNI',
        supplier || 'Distributor'
      );
      logActivity('Logistik', `Menambahkan katalog material baru: ${name}`, `${stock || 0} ${unit}`);
      res.status(201).json({
        success: true,
        message: 'Material berhasil ditambahkan ke inventori gudang!',
        data: { id: info.lastInsertRowid, code, name },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });
}
