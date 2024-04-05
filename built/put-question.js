"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Get the DynamoDB table name from environment variables
const tableName = process.env.QUESTIONS_TABLE;
// Create a DocumentClient that represents the query to add an item
const dynamodb = require("aws-sdk/clients/dynamodb");
const docClient = new dynamodb.DocumentClient(process.env.AWS_SAM_LOCAL
    ? {
        credentials: {
            accessKeyId: "DUMMYACCESSKEY",
            secretAccessKey: "DUMMYSECRETACCESSKEY",
        },
        region: "ap-northeast-1",
        endpoint: "http://dynamodb-local:8000",
    }
    : {});
/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
exports.putQuestionHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    if (event.httpMethod !== "POST") {
        throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method.`);
    }
    // All log statements are written to CloudWatch
    console.info("received:", event);
    // Get id and name from the body of the request
    const body = JSON.parse(event.body);
    const id = body.id;
    const category = body.category;
    const title = body.title;
    const questionText = body.questionText;
    const userId = body.userId;
    // Creates a new item, or replaces an old item with a new item
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
    let response = {
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
        yield docClient.put(params).promise();
        response = Object.assign(Object.assign({}, response), { body: "保存に成功しました", statusCode: 200 });
    }
    catch (ResourceNotFoundException) {
        response = Object.assign(Object.assign({}, response), { statusCode: 404, body: "DynamoDBテーブルが見つかりません。" });
    }
    // All log statements are written to CloudWatch
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    console.log(response, "backResponse");
    return response;
});
