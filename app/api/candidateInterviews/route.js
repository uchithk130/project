import connection from '@/app/utils/db';

export async function GET(req) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return new Response(
      JSON.stringify({ error: "Email is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {

    // Query to fetch interview details along with job details
    const [rows] = await connection.execute(
      `
      SELECT 
        ir.id AS interview_id,
        ir.application_id,
        ir.schedule_time,
        ir.questions,
        ir.score,
        j.job_id,
        j.job_title,
        j.description,
        j.company
      FROM 
        interview_results ir
      INNER JOIN 
        jobs j ON ir.job_id = j.job_id
      INNER JOIN 
        admins a ON a.admin_id = j.admin_id
      WHERE 
        ir.email = ?;
      `,
      [email]
    );


    // Return the fetched data
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching candidate interviews:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch interviews" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
