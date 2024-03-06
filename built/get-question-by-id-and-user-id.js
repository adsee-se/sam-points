var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.getQuestionByIdAndUserIdHandler = (event) => __awaiter(this, void 0, void 0, function* () {
    if (event.httpMethod !== "GET") {
        throw new Error(`getMethod only accept GET method, you tried: ${event.httpMethod}`);
    }
    const id = event.pathParameters.id;
    const userId = event.pathParameters.userId;
    let response = {
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
        const data = yield docClient.get(params).promise();
        const item = data.Item;
        response = Object.assign(Object.assign({}, response), { statusCode: 200, body: JSON.stringify(item) });
    }
    catch (ResourceNotFoundException) {
        response = Object.assign(Object.assign({}, response), { statusCode: 404, body: "Unable to call DynamoDB. Table resource not found." });
    }
    return response;
});
