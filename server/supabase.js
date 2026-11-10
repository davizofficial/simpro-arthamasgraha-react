import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const supabaseUrl = process.env.SUPABASE_URL || '';
export const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
export const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

export const supabase =
  supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export const isSupabaseConfigured = () => Boolean(supabaseUrl && (supabaseServiceKey || supabaseAnonKey));

export const isPostgresConfigured = () => Boolean(databaseUrl);

export function createPgPool(connectionString = databaseUrl) {
  if (!connectionString) return null;

  return new Pool({
    connectionString,
    ssl:
      process.env.PGSSLMODE === 'disable'
        ? false
        : {
            rejectUnauthorized: false,
          },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}
