const tableName = process.env.QUESTIONS_TABLE;

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

exports.getQuestionByIdAndUserIdHandler = async (event: any) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const id = event.pathParameters.id;
  const userId = event.pathParameters.userId;

  let response: { statusCode: number; body: any; headers?: any } = {
    statusCode: 500,
    body: {},
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*",
    },
  };

  try {
    const params = {
      TableName: tableName,
      Key: { id: id, userId: userId },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;

    response = {
      ...response,
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (ResourceNotFoundException) {
    response = {
      ...response,
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  return response;
};
