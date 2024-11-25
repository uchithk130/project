import { NextResponse } from 'next/server';
import connection from '../../utils/db'; // Ensure your DB connection is correct

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  // Get the admin email from the query params (e.g., admin_email)
  const admin_email = searchParams.get('admin_email');
  
  if (!admin_email) {
    return NextResponse.json({ message: 'Admin email is required' }, { status: 400 });
  }

  try {
    // Step 1: Get the admin_id from the Admins table using the email
    const [adminResults] = await connection.execute(
      'SELECT admin_id FROM Admins WHERE email = ?',
      [admin_email]
    );
    
    if (adminResults.length === 0) {
      return NextResponse.json({ message: 'Admin not found' }, { status: 404 });
    }

    const adminId = adminResults[0].admin_id;

    // Step 2: Get the job_ids posted by the admin
    const [jobResults] = await connection.execute(
      'SELECT job_id FROM Jobs WHERE admin_id = ?',
      [adminId]
    );

    if (jobResults.length === 0) {
      return NextResponse.json({ message: 'No jobs posted by this admin' }, { status: 404 });
    }

    // Step 3: Fetch candidate details for each job_id from JobApplications
    let candidateData = [];
    for (let job of jobResults) {
      const [applicationResults] = await connection.execute(
        'SELECT candidate_id, resume, photo FROM JobApplications WHERE job_id = ?',
        [job.job_id]
      );

      // Step 4: Get candidate details for each candidate
      for (let application of applicationResults) {
        const [candidateResults] = await connection.execute(
          'SELECT candidate_id, name, email, company, highest_education, college_name, address, interest_domains, created_at FROM Candidates WHERE candidate_id = ?',
          [application.candidate_id]
        );

        if (candidateResults.length > 0) { 
          candidateData.push({
            ...candidateResults[0],
            job_id:job.job_id,
            resume: application.resume,  
            photo: application.photo,
          });
        }
      }
    }

    // Step 5: Return the candidate data
    console.log(candidateData);
    return NextResponse.json(candidateData, { status: 200 });

  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ message: 'Error fetching data', error: error.message }, { status: 500 });
  }
}
