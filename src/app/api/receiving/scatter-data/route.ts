import { NextRequest } from 'next/server';
import { Client } from 'pg';
import 'dotenv/config';

async function getAllowedStats(client: Client): Promise<string[]> {
  const sql = `
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'receiving_stats'
      AND data_type IN ('integer', 'numeric', 'double precision', 'real')
      AND column_name NOT IN ('season', 'age');
  `;
  const result = await client.query(sql);
  return result.rows.map(r => r.column_name);
}

export async function GET(req: NextRequest) {
    const client = new Client();
    const { searchParams } = new URL(req.url);
    const primaryStat = searchParams.get("primaryStat");
    const secondaryStat = searchParams.get("secondaryStat");
    const startYear = searchParams.get("startYear");
    const endYear = searchParams.get("endYear");
    const aggregate = searchParams.get("aggregate") || "average";
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!primaryStat || !secondaryStat) {
        return new Response("Both primaryStat and secondaryStat are required", { status: 400 });
    }

    if (aggregate !== "total" && aggregate !== "average") {
        return new Response("Aggregate must be 'total' or 'average'", { status: 400 });
    }

    try {
        await client.connect();

        // Validate stats to prevent SQL injection
        const allowedStats = await getAllowedStats(client);
        if (!allowedStats.includes(primaryStat) || !allowedStats.includes(secondaryStat)) {
            return new Response("Invalid stat column", { status: 400 });
        }

        const whereClauses = ["player IS NOT NULL"];
        const params: (string | number)[] = [];
        let paramIdx = 1;

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

        const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

        // Use SUM for total, AVG for average
        const aggregateFunc = aggregate === "total" ? "SUM" : "AVG";

        const sql = `
            SELECT 
                player,
                ${aggregateFunc}(${primaryStat}) as ${primaryStat},
                ${aggregateFunc}(${secondaryStat}) as ${secondaryStat}
            FROM receiving_stats
            ${whereSQL}
            GROUP BY player
            HAVING ${aggregateFunc}(${primaryStat}) > 0 AND ${aggregateFunc}(${secondaryStat}) > 0
            ORDER BY ${aggregateFunc}(${primaryStat}) DESC
            LIMIT $${paramIdx}
        `;

        params.push(limit);

        const result = await client.query(sql, params);

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching scatter data:', error);
        return new Response('Internal Server Error', { status: 500 });
    } finally {
        await client.end();
    }
} 