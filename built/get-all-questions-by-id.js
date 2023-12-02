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
exports.getAllQuestionsByIdHandler = (event) => __awaiter(this, void 0, void 0, function* () {
    const user_id = Number(event.pathParameters.id);
    let response = { statusCode: 0, body: {} };
    try {
        const params = {
            TableName: tableName,
            FilterExpression: "user_id = :user_idValue",
            ExpressionAttributeValues: {
                ":user_idValue": user_id,
            },
        };
        const data = yield docClient.scan(params).promise();
        const items = data.Items;
        response = {
            statusCode: 200,
            body: JSON.stringify(items),
        };
    }
    catch (error) {
        console.error("エラー:", error);
        if (error.code === "ResourceNotFoundException") {
            response = {
                statusCode: 404,
                body: "DynamoDBテーブルが見つかりません。",
            };
        }
        else {
            response = {
                statusCode: 500,
                body: "内部サーバーエラー",
            };
        }
    }
    // 全てのログは CloudWatch に書き込まれます
    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
});
