import { NextRequest } from 'next/server';
import { Client } from 'pg';
import 'dotenv/config';


export async function GET(req: NextRequest) {
    console.log('req: ',req)
    const client = new Client();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const query = searchParams.get("query")?.toLowerCase() || "";


    try {
        await client.connect();
        // const result = await client.query(`
        //     SELECT player
        //     FROM receiving_stats
        //     WHERE player IS NOT NULL
        //     GROUP BY player
        //     ORDER BY SUM(yards) DESC;
        //   `);
        const result = await client.query(
            `
              SELECT player
              FROM receiving_stats
              WHERE player IS NOT NULL AND LOWER(player) LIKE $1
              GROUP BY player
              ORDER BY SUM(yards) DESC
              LIMIT $2 OFFSET $3
            `,
            [`%${query}%`, limit, offset]
          );

        return new Response(JSON.stringify(result.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error fetching player names:', error);
        return new Response('Internal Server Error', { status: 500 });
    } finally {
        await client.end();
    }
}