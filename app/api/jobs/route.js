import { NextResponse } from 'next/server';
import connection from '../../utils/db';

export async function GET() {
  try {
    const query = 'SELECT job_id, job_title, last_date_to_apply FROM Jobs';
    const [jobs] = await connection.query(query);

    return NextResponse.json(jobs);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
