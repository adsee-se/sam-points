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
const tableName = process.env.POINTS_TABLE;
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
exports.getAllPointsHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("test");
    if (event.httpMethod !== "GET") {
        throw new Error(`getAllItems only accept GET method, you tried: ${event.httpMethod}`);
    }
    console.info("received:", event);
    let response = { statusCode: 0, body: {} };
    try {
        console.log(tableName, "tableName");
        const params = {
            TableName: tableName,
        };
        const data = yield docClient.scan(params).promise();
        const items = data.Items;
        response = {
            statusCode: 200,
            body: JSON.stringify(items),
        };
    }
    catch (ResourceNotFoundException) {
        response = {
            statusCode: 404,
            body: "Unable to call DynamoDB. Table resource not found.",
        };
    }
    console.log(response);
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
});
