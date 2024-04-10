const tableName = process.env.POINTS_TABLE;

const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient(
  process.env.AWS_SAM_LOCAL
    ? {
        credentials: {
          accessKeyId: "DUMMYACCESSKEY",
          secretAccessKey: "DUMMYSECRETACCESSKEY",
        },
        region: "ap-northeast-1",
        endpoint: "http://dynamodb-local:8000",
      }
    : {}
);

exports.getAllPointsHandler = async (event: any) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  console.info("received:", event);

  let response: { statusCode: number; body: any } = { statusCode: 200, body: {} };

  try {
    const params = {
      TableName: tableName,
    };
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    response = {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (ResourceNotFoundException) {
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};

export {};
