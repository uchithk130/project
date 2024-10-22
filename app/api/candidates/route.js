import { NextResponse } from 'next/server';
import connection from '../../utils/db'; // Assuming you have a connection utility in utils/db

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  try {
    // Execute the MySQL query to find the candidate based on the email
    const [rows] = await connection.execute(
      'SELECT candidate_id,name FROM Candidates WHERE email = ?',
      [email]
    );

    // Check if the candidate is found
    if (rows.length > 0) {
      return NextResponse.json({ candidate_id: rows[0].candidate_id,name:rows[0].name }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Candidate not found' }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return NextResponse.json({ message: 'Error fetching candidate', error: error.message }, { status: 500 });
  }
}
