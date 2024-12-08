const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
/**
 *  Funcion para recuperar datos del caché si existen y no han expirado
 * @param cacheKey 
 * @returns 
 */
export const getFromCache = async (cacheKey:string) => {
    const params = {
      TableName: 'ApiCache',
      Key: { cacheKey }
    };
  
    const result = await dynamodb.get(params).promise();
    if (result.Item && result.Item.expiresAt > Math.floor(Date.now() / 1000)) {
      return JSON.parse(result.Item.data);
    }
    return null;
  };
  