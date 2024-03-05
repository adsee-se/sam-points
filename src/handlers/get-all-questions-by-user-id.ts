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

exports.getAllQuestionsByUserIdHandler = async (event: any) => {
  const userId = event.pathParameters.userId;
  let response: { statusCode: number; body: any; headers?: any } = {
    statusCode: 0,
    body: {},
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3001/",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };

  try {
    const params = {
      TableName: tableName,
      FilterExpression: "userId = :userIdValue",
      ExpressionAttributeValues: {
        ":userIdValue": userId,
      },
    };
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    response = {
      ...response,
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (error) {
    if (error.code === "ResourceNotFoundException") {
      response = {
        ...response,
        statusCode: 404,
        body: "DynamoDBテーブルが見つかりません。",
      };
    } else {
      response = {
        ...response,
        statusCode: 500,
        body: "内部サーバーエラー",
      };
    }
  }

  return response;
};

export {};
