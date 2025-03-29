import { NextResponse } from "next/server";
import connection from "@/app/utils/db";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const admin_email = searchParams.get("admin_email");
    if (!admin_email) {
      return NextResponse.json({ error: "Missing admin_email" }, { status: 400 });
    }
    // Example join: adjust table/column names as needed.
    const [rows] = await connection.execute(
      `SELECT i.*, c.name, c.email, c.highest_education, c.college_name, c.resume_link, c.photo_link, j.job_title
       FROM interview i
       JOIN JobApplications ja ON i.application_id = ja.application_id
       JOIN Candidates c ON i.candidate_id = c.candidate_id
       JOIN Jobs j ON i.job_id = j.job_id
       JOIN Admins a ON j.admin_id = a.admin_id
       WHERE a.email = ?`,
      [admin_email]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
