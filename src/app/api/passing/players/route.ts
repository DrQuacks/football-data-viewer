import { NextRequest } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function getAllowedStats(): Promise<string[]> {
  const sql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'passing_stats'
      AND data_type IN ('integer', 'numeric', 'double precision', 'real')
      AND column_name NOT IN ('season', 'age');
  `;
  const result = await pool.query(sql);
  return result.rows.map(r => r.column_name);
}

export async function GET(req: NextRequest) {
    console.log('req: ',req)
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const query = searchParams.get("query")?.toLowerCase() || "";

    try {

        const startYear = searchParams.get("startYear");
        const endYear = searchParams.get("endYear");

        const whereClauses = ["player IS NOT NULL", "LOWER(player) LIKE $1"];
        const params: (string | number)[] = [`%${query}%`];
        let paramIdx = 2;

        if (startYear) {
            whereClauses.push(`season >= $${paramIdx}`);
            params.push(Number(startYear));
            paramIdx++;
        }
        if (endYear) {
            whereClauses.push(`season <= $${paramIdx}`);
            params.push(Number(endYear));
            paramIdx++;
        }
        console.log('where clauses are: ', whereClauses, 'params are: ', params)

        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const stat = searchParams.get("stat") || "yards"; // default to yards if not provided

        // Validate stat to prevent SQL injection
        const allowedStats = await getAllowedStats();
        if (!allowedStats.includes(stat)) {
        return new Response("Invalid stat column", { status: 400 });
        }

        const sql = `
            SELECT player
            FROM passing_stats
            ${whereSQL}
            GROUP BY player
            ORDER BY SUM(${stat}) DESC
            LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
        `;
        console.log('sql is: ', sql, 'params are: ', params)

        params.push(limit, offset);

        const result = await pool.query(sql, params);

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching player names:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
} 