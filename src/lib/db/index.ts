import mysql from 'mysql2/promise';

let pool: mysql.Pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined');
    }
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

export async function query<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function queryOne<T = unknown>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

export { getPool as pool };
export { getPool as getConnection };