import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import connection from '@/app/utils/db';
import nodemailer from 'nodemailer';

// Initialize AWS S3 v3 client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any email service like SendGrid, or Mailgun.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send an email
// Function to send an email
const sendRegistrationEmail = async (email, candidateName) => {
  const mailOptions = {
    from: '"Interview Automation" <interviewautomation35@gmail.com>', // Replace with your email address
    to: email,
    subject: 'Thank You for Registering with Interview Automation!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50;">Thank You for Registering!</h2>
        <p>Dear <strong>${candidateName}</strong>,</p>
        <p>Thank you for registering with <strong>Interview Automation</strong>. We noticed that you have a lot of skills, and based on your profile, you will receive personalized job recommendations.</p>
        <p>We wish you all the best for your future interviews!</p>
        <p style="margin-top: 20px;">Best Regards,<br/>The Interview Automation Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      candidateName,
      email,
      password,
      company,
      highestEducation,
      collegeName,
      address,
      interestDomains,
      resume, // base64 encoded
      resumeName,
      resumeType,
      photo, // base64 encoded
      photoName,
      photoType,
    } = body;

    // Convert base64 strings to Buffers if resume and photo are provided
    const resumeBuffer = resume ? Buffer.from(resume, 'base64') : null;
    const photoBuffer = photo ? Buffer.from(photo, 'base64') : null;

    // Upload resume and photo to S3 (only if provided)
    const uploadToS3 = async (fileBuffer, fileName, folder, contentType) => {
      if (!fileBuffer || !fileName) return null;
      const uploadParams = {
        Bucket: "uchith",
        Key: `${folder}/${fileName}`,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read',
      };

      const command = new PutObjectCommand(uploadParams);
      await s3Client.send(command);
      return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    };

    const resumeUrl = await uploadToS3(resumeBuffer, resumeName, 'resumes', resumeType);
    const photoUrl = await uploadToS3(photoBuffer, photoName, 'photos', photoType);

    // Ensure fields are not undefined, empty strings are replaced with null
    const safeValues = {
      candidateName: candidateName || null,
      email: email || null,
      password: password || "",
      company: company || null,
      resumeUrl: resumeUrl || null,
      photoUrl: photoUrl || null,
      highestEducation: highestEducation || null,
      collegeName: collegeName || null,
      address: address || null,
      interestDomains: interestDomains || null,
    };

    // Insert candidate information into MySQL database
    const [result] = await connection.execute(
      `INSERT INTO Candidates (name, email, password, company, resume_link, photo_link, highest_education, college_name, address, interest_domains)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safeValues.candidateName,
        safeValues.email,
        safeValues.password,
        safeValues.company,
        safeValues.resumeUrl,
        safeValues.photoUrl,
        safeValues.highestEducation,
        safeValues.collegeName,
        safeValues.address,
        safeValues.interestDomains,
      ]
    );

    // Send confirmation email
    await sendRegistrationEmail(email, candidateName, company, resumeUrl);

    return NextResponse.json({
      message: 'Candidate registered successfully and email sent',
      candidateId: result.insertId,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to register candidate' }, { status: 500 });
  }
}
