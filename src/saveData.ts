import { APIGatewayProxyEvent } from "aws-lambda";

const { v4 } = require('uuid');
const AWS = require('aws-sdk');


const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Esta función crea un nuevo usuario con un id automatico
 * en una tabla de DynamoDB llamada UsersTable 
 * @param event 
 * @returns 
 */
export const saveUser = async(event:APIGatewayProxyEvent) => {

  try{
    const { name, email } = JSON.parse(event.body!);

    if (!name || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Name and email are required fields' })
        };
    }

    const user = {
        id: v4(),
        name,
        email,
        createdAt: new Date().toISOString()
    };

    const params = {
        TableName: 'UsersTable',
        Item: user
    };

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