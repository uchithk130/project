
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import connection from '@/app/utils/db';
import nodemailer from 'nodemailer'; 


// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email after application submission
const sendApplicationEmail = async (email, jobTitle,candidateName,company) => {
  const mailOptions = {
    from: '"Interview Automation" <interviewautomation35@gmail.com>',
    to: email,
    subject: `Application Received: ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50;">Application Received</h2>
        <p>Dear ${candidateName},</p>
        <p>Thank you for applying for the position of <strong>${jobTitle}</strong> at ${company}. We will review your application and get back to you soon.</p>
        <p style="margin-top: 20px;">Best Regards,<br/>The Interview Automation Team</p>
      </div>
    `,
  }; 

  await transporter.sendMail(mailOptions);
};

// Function to upload files to S3

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, jobId, resumeUrl, photoUrl, extractedData } = body;

    // Ensure email and jobId are provided
    if (!email || !jobId) {
      return NextResponse.json({ error: 'Email and Job ID are required.' }, { status: 400 });
    }

    // Fetch candidate ID using the email
    const [candidates] = await connection.execute("SELECT candidate_id,name FROM Candidates WHERE email = ?", [email]);
    if (candidates.length === 0) {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    const candidateId = candidates[0].candidate_id;
    const candidateName = candidates[0].name;

    // Fetch job details
    const [job] = await connection.execute("SELECT job_title,company FROM Jobs WHERE job_id = ?", [jobId]);
    if (!job.length) {
      return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
    }

    const jobTitle = job[0].job_title;
    const company = job[0].company;
 

    // Update the candidate's resume and photo URLs in the Candidates table
    // Insert the job application into the database
    await connection.execute(
      `INSERT INTO JobApplications (job_id, candidate_id,resume,photo ,applied_at,extracted_data) VALUES (?, ?,?,?, CURRENT_TIMESTAMP,?)`,
      [jobId, candidateId,resumeUrl,photoUrl,extractedData]
    );

    // Send application confirmation email
    await sendApplicationEmail(email, jobTitle,candidateName,company);


    return NextResponse.json({ message: 'Application submitted successfully.', res:"Sucess"}, { status: 200 });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 });
  }
}
