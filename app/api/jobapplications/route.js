import { NextResponse } from 'next/server';
import connection from '../../utils/db'; // Make sure your DB connection is correct

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const candidate_id = searchParams.get('candidate_id');

  try {
    // MySQL query to fetch job applications for the given candidate_id
    const [rows] = await connection.execute(
      'SELECT * FROM JobApplications WHERE candidate_id = ?',
      [candidate_id]
    );

    // Return the applications if found
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json({ message: 'Error fetching applications', error: error.message }, { status: 500 });
  }
}
