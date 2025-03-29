import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import connection from '@/app/utils/db';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs"; 
import path from "path"; 
import axios from "axios"; 

// Initialize GoogleGenerativeAI with your API_KEY.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Initialize AWS S3 client
const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});


// Function to upload files to S3
const uploadFileToS3 = async (fileBuffer, fileName, folder, contentType) => {
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

export async function POST(req) {
  try {
    const body = await req.json();
    const { jobId, resumeBase64, resumeName, resumeType, photoBase64, photoName, photoType } = body;
    console.log(jobId)
    const [job] = await connection.execute("SELECT * FROM jobs WHERE job_id = ?", [jobId]);
    
    const jobDescription = job[0].description;
    const jobEligibility = job[0].eligibility;
 
    // Convert base64 strings to Buffers for resume and photo uploads
    const resumeBuffer = resumeBase64 ? Buffer.from(resumeBase64, 'base64') : null;
    const photoBuffer = photoBase64 ? Buffer.from(photoBase64, 'base64') : null;

    // Upload resume and photo to S3
    const resumeUrl = await uploadFileToS3(resumeBuffer, resumeName, 'resumes', resumeType);
    const photoUrl = await uploadFileToS3(photoBuffer, photoName, 'photos', photoType);



    const response = await axios.get(resumeUrl, {
      responseType: "arraybuffer",
    });

    if (!response || !response.data) {
      return new Response(
        JSON.stringify({ error: "Invalid resume link or no data fetched." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Define the file name and type
    const contentType = response.headers["content-type"] || "application/pdf";
    const fileName = path.basename(resumeUrl) || "resume.pdf";

    // Save the file temporarily in /tmp directory on Vercel
    const tempDir = "/tmp";
    const tempFilePath = path.join(tempDir, fileName);

    // Ensure the directory exists before writing the file
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write the file to the temporary directory
    fs.writeFileSync(tempFilePath, Buffer.from(response.data));

    // Upload the file to Google AI File Manager
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: "application/pdf", // MIME type explicitly set
      displayName: "Uploaded Resume",
    });

    console.log("Upload Response:", uploadResponse);

    // Generate structured content using the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: "application/pdf", // Explicit MIME type
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: ` Extract information from resume in below structure and for score give based on job descriptiona nd eligibility on 100 scale
        Job Description:
        ${jobDescription}
        JobEligibility :
        ${jobEligibility}
        {
            "extractedData": {
              "Name": "", 
              "Email": "",
              "Phone": "",
              "Experience": [
                {
                  "Company": "",
                  "Title": "",
                  "Description": "",
                  "TechStack": ""
                }
              ],
              "Education": [
                {
                  "Institution": "",
                  "Degree": "", 
                  "CGPA": ""
                }
              ],
              "Skills": [
                ""
              ],
              "Projects": [
                {
                  "Name": "", 
                  "Technologies": "",
                  "Description": ""
                }
              ],
              "Achievements": [
                ""
              ]
              "Score" : "",
            }
          }
        `,
      },
    ]);

    // Parse the result into JSON 
    console.log(result.response.text());
    let extractedText = result.response.text();
    extractedText = extractedText.replace(/```json\n|```/g, "");
    const extractedData = JSON.parse(extractedText);

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);


    return NextResponse.json({ message: 'Application submitted successfully.', extractedData: extractedData,resumeUrl
      : resumeUrl,photoUrl:photoUrl
     }, { status: 200 });
  } catch (error) {
    console.error('Error processing application:', error);
    return NextResponse.json({ error: 'Failed to submit application.' }, { status: 500 });
  }
}
