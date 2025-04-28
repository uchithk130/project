// app/api/proctoring/route.js
import { RekognitionClient, CompareFacesCommand } from "@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: "us-east-1", 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  const { imageData } = await req.json(); // Retrieve JSON from request body

  try {
    const buffer = Buffer.from(imageData, 'base64'); // Convert base64 string to buffer

    const params = {
      SourceImage: {
        S3Object: {
          Bucket: "uchith", 
          Name: "Uchith.jpg", 
        },
      },
      TargetImage: {
        Bytes: buffer,
      },
      SimilarityThreshold: 90,
    };

    const command = new CompareFacesCommand(params);
    const response = await rekognitionClient.send(command);

    // Check for matches and extract similarity
    if (response.FaceMatches && response.FaceMatches.length > 0) {
      return new Response(JSON.stringify({ 
        matched: true, 
        similarity: response.FaceMatches[0].Similarity 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ 
        matched: false 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error("Error calling Rekognition: ", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
