import { NextRequest } from 'next/server';
import { Client } from 'pg';
import 'dotenv/config';


export async function GET(req: NextRequest) {
  const client = new Client();

  const { searchParams } = new URL(req.url);
  const season = searchParams.get('season');

  try {
    await client.connect();

    const result = await client.query(
      `SELECT * FROM receiving_stats WHERE ($1::int IS NULL OR season = $1)`,
      [season ? Number(season) : null]
    );

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('error: ',error)
    return new Response(JSON.stringify({ error: 'Database error' }), {
      status: 500,
    });
  } finally {
    await client.end();
  }
}