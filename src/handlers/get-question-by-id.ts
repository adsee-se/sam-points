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

exports.getQuestionByIdHandler = async (event: any) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMethod only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const id = event.pathParameters.id;
  const userId = event.pathParameters.userId;

  let response: { statusCode: number; body: any } = {
    statusCode: 500,
    body: {},
  };

  try {
    const params = {
      TableName: tableName,
      Key: { id: Number(id), userId: Number(userId) },
    };
    const data = await docClient.get(params).promise();
    const item = data.Item;

    response = {
      statusCode: 200,
      body: JSON.stringify(item),
    };
  } catch (ResourceNotFoundException) {
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
    };
  }

  return response;
};
