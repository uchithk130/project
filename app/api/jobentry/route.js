import connection from '../../utils/db';

export async function POST(req) {
  const { jobTitle, description, eligibility_criteria, lastDateToApply,companyName } = await req.json();

  try {
    const insertJobQuery = `
      INSERT INTO Jobs (job_title, job_description, eligibility_criteria, last_date_to_apply,company_name)
      VALUES (?, ?, ?, ?,?)
    `;
    
    const values = [jobTitle, description, eligibility_criteria, lastDateToApply,companyName];
    await connection.query(insertJobQuery, values);

    return new Response(JSON.stringify({ message: 'Job added successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to add job' }), { status: 500 });
  }
}