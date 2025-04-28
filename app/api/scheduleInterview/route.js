import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer'; 
import connection from '@/app/utils/db';

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    // Get request data (interview date/time and selected applications)
    const { interviewDateTime, selectApplications } = await req.json();

    // Create the email content
    const subject = `Interview Scheduled for Your ${interviewDateTime} Interview`;

    // Define the text and HTML content for the email
    const textContent = (candidateName, jobTitle, jobCompany) => `
      Dear ${candidateName},

      We are pleased to inform you that your interview for the position of ${jobTitle} at ${jobCompany} has been scheduled.

      Interview Details:
      - Date: ${interviewDateTime}
      - Position: ${jobTitle}
      - Company: ${jobCompany}
      - Location: Virtual/On-site (adjust accordingly)
      - Please ensure you are available at the scheduled time.

      Best Regards,
      [Your Company Name] Recruitment Team
    `;

    const htmlContent = (candidateName, jobTitle, jobCompany) => `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #333;">Interview Scheduled for Your Application</h2>
        <p style="color: #555;">Dear ${candidateName},</p>
        <p style="color: #555;">We are pleased to inform you that your interview for the position of <strong>${jobTitle}</strong> at <strong>${jobCompany}</strong> has been scheduled.</p>
        <h3 style="color: #333;">Interview Details:</h3>
        <ul style="color: #555;">
          <li><strong>Date:</strong> ${interviewDateTime}</li>
          <li><strong>Position:</strong> ${jobTitle}</li>
          <li><strong>Company:</strong> ${jobCompany}</li>
          <li><strong>Location:</strong> Virtual/On-site (adjust accordingly)</li>
        </ul>
        <p style="color: #555;">Please ensure you are available at the scheduled time.</p>
        <p style="color: #555;">Best Regards,<br/>[Your Company Name] Recruitment Team</p>
      </div>
    `;

    // Loop through each selected application and send emails
    for (const application of selectApplications) {
      const { job_title, name, Jobcompany, email,application_id,candidate_id,job_id } = application;

      // Create email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email, 
        subject: subject,
        text: textContent(name, job_title, Jobcompany),
        html: htmlContent(name, job_title, Jobcompany), 
      };

      // Send the email
      const interviewTime = interviewDateTime.replace("IST", "GMT+0530");
      console.log(interviewTime);
      const date = new Date(interviewTime);
      console.log(date)
      const ISTOffset = 5.5 * 60 * 60 * 1000; // Offset in milliseconds (5.5 hours)
      const istDate = new Date(date.getTime() + ISTOffset);
      const mysqlDate = istDate.toISOString().slice(0, 19).replace("T", " ");
      console.log(mysqlDate)
      await connection.execute(
        `INSERT INTO interview_results (job_id, candidate_id,application_id,email ,created_at,schedule_time) VALUES (?, ?,?,?, CURRENT_TIMESTAMP,?)`,
        [job_id, candidate_id,application_id,email,mysqlDate]
      );

      await transporter.sendMail(mailOptions);
    }

    // Log success and send response
    console.log('Emails sent successfully');
    return NextResponse.json({ message: 'Interview scheduled and emails sent successfully' });
  } catch (error) {
    console.error('Error scheduling interview and sending emails:', error);
    return NextResponse.json({ message: 'Failed to schedule interview and send emails' }, { status: 500 });
  }
}
