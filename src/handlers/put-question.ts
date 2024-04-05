// Get the DynamoDB table name from environment variables
const tableName = process.env.QUESTIONS_TABLE;

// Create a DocumentClient that represents the query to add an item
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

interface Body {
  id: string;
  userId: string;
  category: string;
  title: string;
  questionText: string;
}

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putQuestionHandler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id and name from the body of the request
  const body: Body = JSON.parse(event.body);
  const id = body.id;
  const category = body.category;
  const title = body.title;
  const questionText = body.questionText;
  const userId = body.userId;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  let response: { statusCode: number; body?: string; headers?: any } = {
    statusCode: 999,
    body: "",
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
      Item: { id, userId, category, title, questionText },
    };
    await docClient.put(params).promise();

    response = {
      ...response,
      body: "保存に成功しました",
      statusCode: 200,
    };
  } catch (ResourceNotFoundException) {
    response = {
      ...response,
      statusCode: 404,
      body: "DynamoDBテーブルが見つかりません。",
    };
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );

  console.log(response, "backResponse");

  return response;
};

export {};
