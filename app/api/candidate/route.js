// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { TextractClient, StartDocumentTextDetectionCommand } from "@aws-sdk/client-textract";

// const s3 = new S3Client({ region: "us-east-1" });
// const textract = new TextractClient({ region: "us-east-1" });

// export async function POST(req) {
//   const formData = await req.formData();
//   const name = formData.get('name');
//   const photo = formData.get('photo');
//   const resume = formData.get('resume');

//   try {
//     // Convert the photo to a Buffer
//     const photoArrayBuffer = await photo.arrayBuffer();
//     const photoBuffer = Buffer.from(photoArrayBuffer);

//     // Upload photo to S3
//     const photoParams = {
//       Bucket: "uchith",
//       Key: `${name}.jpg`,
//       Body: photoBuffer,
//       ContentType: 'image/jpeg',
//     };
//     await s3.send(new PutObjectCommand(photoParams));

//     // Convert the resume to a Buffer
//     const resumeArrayBuffer = await resume.arrayBuffer();
//     const resumeBuffer = Buffer.from(resumeArrayBuffer);

//     // Upload resume to S3
//     const resumeParams = {
//       Bucket: "uchith",
//       Key: `${name}.pdf`,
//       Body: resumeBuffer,
//       ContentType: 'application/pdf',
//     };
//     await s3.send(new PutObjectCommand(resumeParams));

//     // Optionally parse the resume using AWS Textract
//     const textractParams = {
//       DocumentLocation: {
//         S3Object: {
//           Bucket: "uchith",
//           Name: `${name}.pdf`,
//         },
//       },
//     };
//     await textract.send(new StartDocumentTextDetectionCommand(textractParams));

//     return new Response(JSON.stringify({ message: 'Success' }), { status: 200 });
//   } catch (error) {
//     console.error("Error occurred:", error);
//     return new Response(JSON.stringify({ error: 'Something went wrong' }), { status: 500 });
//   }
// }
import { db } from "../../utils/db"; // Ensure this imports your DB connection setup

export async function POST(req) {
  try {
    const { userId, email } = await req.json();

    // Check if the candidate already exists
    const existingCandidate = await db.query(
      "SELECT * FROM candidates WHERE user_id = $1",
      [userId]
    );

    if (existingCandidate.rows.length === 0) {
      // Insert new candidate entry
      await db.query(
        "INSERT INTO Candidates (user_id, email) VALUES ($1, $2)",
        [userId, email]
      );
      return new Response(JSON.stringify({ message: "Candidate created" }), { status: 201 });
    } else {
      return new Response(JSON.stringify({ message: "Candidate already exists" }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error creating candidate", error }), { status: 500 });
  }
}
