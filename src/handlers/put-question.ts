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

// TODO 他箇所でも使用するのであれば共通化する
interface Event {
  httpMethod: string;
  body: string;
  path: string;
}

interface Body {
  category: string;
  title: string;
  question_text: string;
}

interface Response {
  statusCode: number;
  body: string;
  headers: Object;
}

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putQuestionHandler = async (event: Event) => {
  console.log("イベント：", event);
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id and name from the body of the request
  const body: Body = JSON.parse(event.body);
  // TODO ログ確認
  console.log("ログ出力で確認：", body);
  const category = body.category;
  const title = body.title;
  const question_text = body.question_text;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  let response: Response = { statusCode: 0, body: "", headers: {} };

  try {
    const params = {
      TableName: tableName,
      Item: { category, title, question_text },
    };

    const data = await docClient.put(params).promise();

    response = {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type,X-CSRF-TOKEN",
      },
    };
  } catch (ResourceNotFoundException) {
    response = {
      statusCode: 404,
      body: "Unable to call DynamoDB. Table resource not found.",
      headers: {},
    };
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );

  return response;
};

export {};
