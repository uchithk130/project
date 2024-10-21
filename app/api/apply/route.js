import connection from '../../utils/db';
import nodemailer from 'nodemailer';

// Function to send a confirmation email
const sendApplicationEmail = async (candidateName, email, jobTitle) => {
  // Create a transporter object using your email provider's SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use Gmail, or any other email service
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS,  // Your email password or app-specific password
    },
  });

  // Email content
  const mailOptions = {
    from: '"Interview Automation" <interviewautomation35@gmail.com>', // Sender address
    to: email, // Candidate's email
    subject: 'Job Application Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50;">Application Received</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Thank you for applying for the job: <strong>${jobTitle}</strong>. Your application has been successfully submitted.</p>
        <p style="margin-top: 20px;">Best regards,<br/>The Interview Automation Team</p>
        <p>If you did not apply for this job or believe this email was sent to you in error, please contact our support team at interviewautomation35@gmail.com.</p>
      </div>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export async function POST(req) {
  const { email, jobId, resumeLink, photoLink, candidateName } = await req.json();

  try {
    // Update candidate information in the Candidates table using email
    const updateCandidateQuery = `
      UPDATE Candidates 
      SET resume_link = ?, photo_link = ? 
      WHERE email = ?
    `;
    const updateValues = [resumeLink, photoLink, email];
    await connection.query(updateCandidateQuery, updateValues);

    // Get candidate ID after updating their information
    const candidateQuery = `
      SELECT candidate_id FROM Candidates WHERE email = ?
    `;
    const [candidateRows] = await connection.query(candidateQuery, [email]);
    
    if (candidateRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Candidate not found' }), { status: 404 });
    }
    const candidateId = candidateRows[0].candidate_id;

    // Retrieve the job title based on jobId
    const jobTitleQuery = `
      SELECT title FROM Jobs WHERE job_id = ?
    `;
    const [jobRows] = await connection.query(jobTitleQuery, [jobId]);
    
    if (jobRows.length === 0) {
      return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 });
    }
    const jobTitle = jobRows[0].title;

    // Insert entry in JobApplications table
    const insertApplicationQuery = `
      INSERT INTO JobApplications (job_id, candidate_id, applied_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `;
    await connection.query(insertApplicationQuery, [jobId, candidateId]);

    // Send confirmation email to the candidate
    await sendApplicationEmail(candidateName, email, jobTitle);

    return new Response(JSON.stringify({ message: 'Application submitted successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to apply for job' }), { status: 500 });
  }
}
