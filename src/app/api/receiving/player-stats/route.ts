import { NextRequest } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");

  if (!player) {
    return new Response("Missing player param", { status: 400 });
  }

  const query = `
    SELECT DISTINCT ON (season) season, yards
    FROM receiving_stats
    WHERE player = $1
    ORDER BY season, yards DESC;
  `;

  const result = await pool.query(query, [player]);
  return Response.json(result.rows);
}