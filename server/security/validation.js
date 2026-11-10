import { z } from 'zod';

const text = (max, min = 0) => z.string().trim().min(min).max(max);
const optText = (max) => z.string().trim().max(max).nullish();
const int = () => z.coerce.number().int().positive();
const money = () => z.coerce.number().positive().max(1e13);
const optNum = () => z.coerce.number().nonnegative().max(1e13).nullish();

const phone = z
  .string()
  .trim()
  .min(5, 'Nomor telepon terlalu pendek')
  .max(30)
  .regex(/^[0-9+()\-\s.]+$/, 'Nomor telepon hanya boleh berisi angka dan + ( ) - .');

const emailOrEmpty = z.union([z.literal(''), z.string().trim().max(120).email('Format email tidak valid')]).nullish();

export const PASSWORD_RULE = z
  .string()
  .min(8, 'Kata sandi minimal 8 karakter')
  .max(72, 'Kata sandi maksimal 72 karakter')
  .regex(/[A-Za-z]/, 'Kata sandi harus memuat huruf')
  .regex(/[0-9]/, 'Kata sandi harus memuat angka');

export const schemas = {
  'POST /auth/login': z
    .object({
      username: text(120).optional(),
      email: text(120).optional(),
      password: z.string().min(1, 'Kata sandi wajib diisi').max(200),
    })
    .refine((v) => v.username || v.email, { message: 'Username wajib diisi' }),

  'POST /auth/change-password': z.object({
    current_password: z.string().min(1).max(200),
    new_password: PASSWORD_RULE,
  }),

  'PUT /settings': z.object({
    company_name: text(150, 1).optional(),
    company_tagline: optText(200),
    address: text(300, 1).optional(),
    phone: text(40, 3).optional(),
    email: z.string().trim().max(120).email().optional(),
    site_survey_photo_required: z
      .union([z.boolean(), z.enum(['true', 'false']).transform((v) => v === 'true')])
      .optional(),
  }),

  'POST /users': z.object({
    name: text(100, 2),
    username: z
      .string()
      .trim()
      .min(3)
      .max(40)
      .regex(/^[a-zA-Z0-9._-]+$/, 'Username hanya huruf, angka, titik, strip, underscore')
      .optional(),
    email: z.string().trim().max(120).email('Format email tidak valid'),
    role: text(40, 2),
    roleLabel: optText(80),
    password: PASSWORD_RULE,
  }),

  'POST /clients': z.object({
    name: text(150, 1),
    company: optText(150),
    category: z.enum(['Swasta', 'Pemerintah', 'BUMN']).optional(),
    contact_person: text(100, 1),
    phone,
    email: emailOrEmpty,
    address: optText(300),
  }),

  'POST /projects': z.object({
    name: text(200, 1),
    location: text(200, 1),
    budget: money(),
    client_id: int().nullish(),
    client_name: optText(150),
    contract_value: optNum(),
    start_date: optText(20),
    end_date: optText(20),
    manager: optText(100),
    description: optText(1000),
  }),

  'POST /site-surveys': z.object({
    project_id: int().nullish(),
    project_name: text(200, 1),
    area_size: optNum(),
    elevation: optText(40),
    soil_type: text(100, 1),
    contour: optText(60),
    accessibility: text(100, 1),
    user_name: optText(100),
  }),

  'PATCH /site-surveys/:id/status': z.object({
    status: z.enum(['approved', 'review', 'pending']),
    reviewer_notes: optText(2000),
    user_name: optText(100),
  }),

  'POST /progress': z.object({
    project_id: int(),
    progress: z.coerce.number().min(0).max(100),
    progress_gain: optNum(),
    notes: z.string().trim().max(2000).default(''),
    issues: optText(2000),
    reporter: optText(100),
  }),

  'POST /materials': z.object({
    name: text(150, 1),
    unit: text(30, 1),
    price_per_unit: money(),
    stock: z.coerce.number().int().nonnegative().max(1e9).nullish(),
    minimum_stock: z.coerce.number().int().nonnegative().max(1e9).nullish(),
    specification: optText(200),
    supplier: optText(150),
  }),

  'POST /material-requests': z.object({
    project_id: int(),
    material_id: int(),
    quantity: int().max(1e9),
    notes: optText(500),
    requested_by: optText(100),
  }),

  'PATCH /material-requests/:id/status': z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'delivered']),
    approved_by: optText(100),
  }),

  'POST /equipments': z.object({
    name: text(150, 1),
    daily_cost: money(),
    condition: optText(80),
    operator: optText(100),
  }),

  'PATCH /equipments/:id/assign': z.object({
    project_id: int().nullish(),
    project_name: optText(200),
    status: optText(60),
  }),

  'POST /finance/transactions': z.object({
    project_id: int(),
    category: z.enum(['material', 'upah', 'sewa_alat', 'operasional', 'subkon']),
    description: optText(300),
    amount: money(),
    type: z.enum(['expense', 'income']).optional(),
  }),

  'POST /documents': z.object({
    name: text(200, 1),
    category: z.enum(['kontrak', 'ded', 'rab', 'laporan']),
    project_id: int(),
    size: optText(30),
    uploaded_by: optText(100),
  }),
};

const toSchemaKey = (method, path) => {
  const normalized = path
    .replace(/\/+$/, '')
    .replace(/^\/proyek\/[^/]+\/laporan$/, '/progress')
    .replace(/^\/(site-surveys|material-requests|equipments|users|clients)\/[^/]+(\/.*)?$/, '/$1/:id$2')
    .replace(/^\/proyek$/, '/projects')
    .replace(/^\/keuangan\/kas$/, '/finance');
  return `${method} ${normalized}`;
};

export const validateBody = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
  const schema = schemas[toSchemaKey(req.method, req.path)];
  if (!schema) return next();

  const raw = { ...(req.body || {}) };
  const pathId = req.path.match(/^\/proyek\/([^/]+)\/laporan$/);
  if (pathId) raw.project_id = pathId[1];

  const result = schema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join('.') || 'body',
      message: i.message,
    }));
    return res.status(400).json({
      success: false,
      error: /^(Invalid|Too small|Too big|expected)/i.test(details[0].message)
        ? `Kolom "${details[0].field}" kosong atau tidak valid`
        : details[0].message,
      details,
    });
  }
  req.body = result.data;
  next();
};

export const bindIdentity = (req, _res, next) => {
  if (req.user && req.path !== '/settings' && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const name = req.user.name;
    req.body = {
      ...(req.body || {}),
      user_name: name,
      reporter: name,
      requested_by: name,
      approved_by: name,
      uploaded_by: name,
      created_by: name,
    };
  }
  next();
};
