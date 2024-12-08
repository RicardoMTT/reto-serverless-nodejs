import { APIGatewayProxyEvent } from "aws-lambda";

const { v4 } = require('uuid');
const AWS = require('aws-sdk');


const dynamodb = new AWS.DynamoDB.DocumentClient();

export const saveUser = async(event:APIGatewayProxyEvent) => {

  try{
    const { name, email } = JSON.parse(event.body!);

    if (!name || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name and email are required fields' })
        };
    }

    // Crear objeto usuario
    const user = {
        id: v4(),
        name,
        email,
        createdAt: new Date().toISOString()
    };

    // Parámetros para DynamoDB
    const params = {
        TableName: 'UsersTable',
        Item: user
    };

    
    // Guardar en DynamoDB
    await dynamodb.put(params).promise();
    
    return {
        statusCode: 200,
        body: JSON.stringify(user),
      };
   } catch (error:any) {
    return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({ error: error.message })
      };
   }
}

module.exports = {
    saveUser
}