import connection from '../../utils/db';

export async function POST(req) {
  try {
    const { jobTitle, company, domain, description, eligibilityCriteria, lastDateToApply, email } = await req.json();

    // 1. Get the admin_id from the Admin table using the email
    const getAdminQuery = `
      SELECT admin_id FROM Admins WHERE email = ?
    `;
    const [adminRows] = await connection.query(getAdminQuery, [email]);

    if (adminRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Admin not found' }), { status: 404 });
    }

    const adminId = adminRows[0].admin_id;

    // 2. Insert the job into the Jobs table with the retrieved admin_id
    const insertJobQuery = `
      INSERT INTO Jobs (job_title, description, eligibility, last_date_to_apply, company, admin_id, domain)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [jobTitle, description, eligibilityCriteria, lastDateToApply, company, adminId, domain];
    await connection.query(insertJobQuery, values);

    return new Response(JSON.stringify({ message: 'Job added successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error adding job:', error);
    return new Response(JSON.stringify({ error: 'Failed to add job' }), { status: 500 });
  }
}
