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

exports.getAllQuestionsByIdHandler = async (event: any) => {
  const user_id = Number(event.pathParameters.id);
  let response: { statusCode: number; body: any } = { statusCode: 0, body: {} };

  try {
    const params = {
      TableName: tableName,
      FilterExpression: "user_id = :user_idValue",
      ExpressionAttributeValues: {
        ":user_idValue": user_id,
      },
    };
    const data = await docClient.scan(params).promise();
    const items = data.Items;

    response = {
      statusCode: 200,
      body: JSON.stringify(items),
    };
  } catch (error) {
    console.error("エラー:", error);

    if (error.code === "ResourceNotFoundException") {
      response = {
        statusCode: 404,
        body: "DynamoDBテーブルが見つかりません。",
      };
    } else {
      response = {
        statusCode: 500,
        body: "内部サーバーエラー",
      };
    }
  }

  // 全てのログは CloudWatch に書き込まれます
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
