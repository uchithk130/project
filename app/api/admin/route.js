import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "us-east-1" });

export async function POST(req) {
  const { jobID, description } = await req.json();

  try {
    // Store job description in DynamoDB
    const params = {
      TableName: "JobTable",
      Item: {
        jobID: { S: jobID },
        description: { S: description },
      },
    };
    await dynamoDB.send(new PutItemCommand(params));

    return new Response(JSON.stringify({ message: 'Job added successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to add job' }), { status: 500 });
  }
}
