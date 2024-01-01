// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
const dynamodb = require('aws-sdk/clients/dynamodb');
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

// Get the DynamoDB table name from environment variables
const tableName = process.env.QUESTIONS_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putQuestionHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info('received:', event);

    // Get id and name from the body of the request
    const body = JSON.parse(event.body);
    // TODO ログ確認
    console.log('ログ出力で確認：', body);
    const id = body.id;
    const name = body.name;

    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    let response = {};

    try {
        const params = {
            TableName : tableName,
            Item: { id : id, name: name }
        };

        const result = await docClient.put(params).promise();

        response = {
            statusCode: 200,
          body: JSON.stringify(body),
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3001', // http://localhost:3001 からのアクセスだけを許可
            // 必要に応じて他のCORSヘッダーを追加
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        }
        };
    } catch (ResourceNotFoundException) {
        response = {
            statusCode: 404,
            body: "Unable to call DynamoDB. Table resource not found."
        };
    }

    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
};
