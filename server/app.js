import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { createActivityHelpers } from './context.js';
import { createAuthenticate } from './security/auth.js';
import { createPolicyMiddleware } from './security/policy.js';
import { bindIdentity, validateBody } from './security/validation.js';

import registerSystem from './routes/system.js';
import registerAuth from './routes/auth.js';
import registerUsers from './routes/users.js';
import registerDashboard from './routes/dashboard.js';
import registerProjects from './routes/projects.js';
import registerClients from './routes/clients.js';
import registerSurveys from './routes/surveys.js';
import registerProgress from './routes/progress.js';
import registerMaterials from './routes/materials.js';
import registerMaterialRequests from './routes/materialRequests.js';
import registerEquipments from './routes/equipments.js';
import registerFinance from './routes/finance.js';
import registerDocuments from './routes/documents.js';
import registerReports from './routes/reports.js';
import registerActivity from './routes/activity.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function createApp(db) {
  const app = express();
  const helpers = createActivityHelpers(db);
  const deps = { db, ...helpers };

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (!SAFE_METHODS.has(req.method) && origin && !config.corsOrigins.includes(origin)) {
      return res.status(403).json({ success: false, error: 'Origin tidak diizinkan' });
    }
    next();
  });

  if (config.simulatedLatencyMs > 0) {
    app.use((_req, _res, next) => setTimeout(next, config.simulatedLatencyMs));
  }

  app.use((req, res, next) => {
    const original = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 500 && body && body.error) {
        console.error(`[SIMPRO] ${req.method} ${req.originalUrl} -> ${body.error}`);
        return original({ success: false, error: 'Terjadi kesalahan pada server. Silakan coba lagi.' });
      }
      return original(body);
    };
    next();
  });

  const authenticate = createAuthenticate(db, helpers.getUserPermissions);
  app.use('/api', createPolicyMiddleware(authenticate), validateBody, bindIdentity);

  [
    registerSystem,
    registerAuth,
    registerUsers,
    registerDashboard,
    registerProjects,
    registerClients,
    registerSurveys,
    registerProgress,
    registerMaterials,
    registerMaterialRequests,
    registerEquipments,
    registerFinance,
    registerDocuments,
    registerReports,
    registerActivity,
  ].forEach((register) => register(app, deps));

  app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' }));

  app.use((err, _req, res, _next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ success: false, error: 'Format JSON tidak valid' });
    }
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ success: false, error: 'Payload terlalu besar' });
    }
    console.error('[SIMPRO] Galat tak tertangani:', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan pada server. Silakan coba lagi.' });
  });

  return app;
}
