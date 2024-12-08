import { CACHE_TTL } from "../getData";
import { CacheItem } from "../interfaces/cache-item.interface";

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
/**
 * Funcion para guardar datos en el caché con un TTL de 30 minuto
 * @param cacheKey 
 * @param data 
 */
export const saveToCache = async (cacheKey:string, data:any) => {
    const params = {
      TableName: 'ApiCache',
      Item: {
        cacheKey,
        data: JSON.stringify(data),
        expiresAt: Math.floor(Date.now() / 1000) + CACHE_TTL,
      }as CacheItem
    };
    await dynamodb.put(params).promise();
  };
  