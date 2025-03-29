import { NextResponse } from "next/server";
import connection from "@/app/utils/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const { candidate_id, job_id, status, admin_email } = await req.json();
    if (!candidate_id || !job_id || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Set up Nodemailer transport (ensure environment variables are set)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Retrieve candidate email/name
    const [rows] = await connection.execute(
      `SELECT email, name FROM Candidates WHERE candidate_id = ?`,
      [candidate_id]
    );
    const [row] = await connection.execute(
        `SELECT job_title FROM Jobs WHERE job_id = ?`,
        [job_id]
      );
    if (!rows || rows.length === 0) throw new Error("Candidate not found");
    const candidate = rows[0];

    const subject =
      status === "Selected"
        ? "Congratulations! You have been selected"
        : "Interview Update";
    const text =
      status === "Selected"
        ? `Dear ${candidate.name},\n\nCongratulations! You have been selected for the ${row[0].job_title}.`
        : `Dear ${candidate.name},\n\nWe regret to inform you that you have not been selected at this time.`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: candidate.email,
      subject,
      text,
    });

    return NextResponse.json({ message: "Selection updated and email sent" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
