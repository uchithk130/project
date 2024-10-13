import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "us-east-1" });

export async function POST(req) {
  const { jobID } = await req.json();

  try {
    // Store candidate application in DynamoDB
    const params = {
      TableName: "ApplicationTable",
      Item: {
        jobID: { S: jobID },
        candidateName: { S: "Candidate's Name" }, // Replace with actual candidate data
      },
    };
    await dynamoDB.send(new PutItemCommand(params));

    return new Response(JSON.stringify({ message: 'Application submitted successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to submit application' }), { status: 500 });
  }
}
