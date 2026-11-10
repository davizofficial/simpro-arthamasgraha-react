import { createApp } from '../server/app.js';
import { openDatabase } from '../server/db.js';

let appInstance = null;

export default async function handler(req, res) {
  if (!appInstance) {
    const db = await openDatabase();
    appInstance = createApp(db);
  }
  return appInstance(req, res);
}
