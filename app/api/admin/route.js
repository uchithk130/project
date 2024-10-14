
import connection from '../../utils/db';

export async function POST(req) {
  const { adminName, email, companyName, password } = await req.json();

  try {
    // SQL query to insert the admin details
    const insertAdminQuery = `
      INSERT INTO Admins (name, email, company, password)
      VALUES (?, ?, ?, ?)
    `;

    // Values to be inserted into the Admins table
    const values = [adminName, email, companyName, password];
    await connection.query(insertAdminQuery, values);

    return new Response(JSON.stringify({ message: 'Admin registered successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to register admin' }), { status: 500 });
  }
}
