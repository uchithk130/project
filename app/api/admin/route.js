import connection from '../../utils/db';
import nodemailer from 'nodemailer';

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

    // Send an email after successful registration
    await sendRegistrationEmail(adminName, email, companyName,password);

    return new Response(JSON.stringify({ message: 'Admin registered successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to register admin' }), { status: 500 });
  }
}

// Function to send an email using nodemailer
async function sendRegistrationEmail(adminName, adminEmail, companyName,password) {
  // Create a transporter object using your email provider's SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use Gmail, or any other email service (e.g., SendGrid, Mailgun, etc.)
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    },
  });

  // Email content
  const mailOptions = {
    from: '"Interview Automation" <interviewautomation35@gmail.com>', // Use a professional email domain
    to: adminEmail, // Receiver's email address (newly registered admin)
    subject: 'Welcome to the Interview Automation Admin Portal!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50;">Welcome to Interview Automation!</h2>
        <p>Hello <strong>${adminName}</strong>,</p>
        <p>We are excited to welcome you to <strong>Interview Automation</strong>. Your admin account has been successfully created, and you now have access to our portal to streamline job postings and automate hiring processes.</p>
        <h3 style="color: #333;">Your Login Credentials:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Username:</strong> ${adminEmail}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>You can log in using the link below:</p>
        <a href="http://your-admin-portal-url.com" style="display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Log in Now</a>
        <p style="margin-top: 20px;">Best regards,<br/>The Interview Automation Team</p>
        <p>If you did not sign up for this account or believe this email was sent to you in error, please contact our support team interviewautomation35@gmail.com.</p>
      </div>
    `,
};

  

  // Send the email
  await transporter.sendMail(mailOptions);
}
