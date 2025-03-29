 
  
import { NextResponse } from 'next/server';
import connection from '../../utils/db'; 

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    console.error('Error: Application ID is missing.');
    return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
  }

  try {
    console.log(`Fetching application with ID: ${id}`);

    const [rows] = await connection.execute(
      `
        SELECT 
        ja.application_id,
        ja.job_id,
        ja.candidate_id,
        ja.resume,
        ja.photo,
        ja.applied_at,
        ja.extracted_data,
        j.job_title,
        j.description,
        j.eligibility
      FROM JobApplications ja
      JOIN Jobs j ON ja.job_id = j.job_id
      WHERE ja.application_id = ?

      `,
      [id]
    );

    if (rows.length === 0) {
      console.warn(`Application with ID ${id} not found.`);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = rows[0];
    

    console.log('Application data retrieved successfully:', application);

    return NextResponse.json(application);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
