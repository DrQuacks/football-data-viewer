import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function GET() {
  const sql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'receiving_stats'
      AND data_type IN ('integer', 'numeric', 'double precision', 'real')
      AND column_name NOT IN ('season', 'age','stat','id');
  `;
  const result = await pool.query(sql);
  return Response.json(result.rows.map(r => r.column_name));
}