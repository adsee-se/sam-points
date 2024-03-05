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
const tableName = process.env.QUESTIONS_TABLE;
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
exports.getAllQuestionsByUserIdHandler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = event.pathParameters.userId;
    let response = {
        statusCode: 0,
        body: {},
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type,X-CSRF-TOKEN",
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
        const data = yield docClient.scan(params).promise();
        const items = data.Items;
        response = Object.assign(Object.assign({}, response), { statusCode: 200, body: JSON.stringify(items) });
    }
    catch (error) {
        if (error.code === "ResourceNotFoundException") {
            response = Object.assign(Object.assign({}, response), { statusCode: 404, body: "DynamoDBテーブルが見つかりません。" });
        }
        else {
            response = Object.assign(Object.assign({}, response), { statusCode: 500, body: "内部サーバーエラー" });
        }
    }
    return response;
});
