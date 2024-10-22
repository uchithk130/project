import { NextResponse } from 'next/server';
import connection from '../../utils/db'; // Ensure your DB connection is correct

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  // Handle job_ids[] format
  const job_ids_param = searchParams.getAll('job_ids[]'); // Use getAll for array
  
  if (job_ids_param.length === 0) {
    return NextResponse.json({ message: 'job_ids parameter is required' }, { status: 400 });
  }

  // Convert job_ids to integers and filter out invalid entries
  const job_ids = job_ids_param.map(id => parseInt(id.trim(), 10)).filter(Boolean);

  if (job_ids.length === 0) {
    return NextResponse.json({ message: 'Invalid job_ids provided' }, { status: 400 });
  }

  try {
    // MySQL query to fetch jobs for the given job_ids
    const [rows] = await connection.execute(
      `SELECT * FROM Jobs WHERE job_id IN (${job_ids.map(() => '?').join(',')})`,
      job_ids
    );

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json({ message: 'Error fetching jobs', error: error.message }, { status: 500 });
  }
}
