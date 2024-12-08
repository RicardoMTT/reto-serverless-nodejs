const axios = require('axios');
import { v4 as uuidv4 } from 'uuid';
const { getDietType, formatMeal } = require('./utils/diet.utils');
const AWS = require('aws-sdk');


const dynamodb = new AWS.DynamoDB.DocumentClient();

// Tipos para estructuras de datos
interface CacheItem {
  cacheKey: string;
  data: string;
  expiresAt: number;
}

interface Species {
  url: string;
  name: string;
  classification: string;
}

interface Meal {
  idMeal: string;
  strMeal: string;
  [key: string]: any;
}

interface NewPerson {
  id: string;
  speciesId: string;
  name: string;
  classification: string;
  dietType: string;
  recommendedMeals: Meal[];
  createdAt: string;
}
const CACHE_TTL = 30 * 60; // 30 minutos en segundos

// Funcion para obtener una key basado en el type y el id
export const getCacheKey = (type:string, id:string) => `${type}_${id}`;

// Funcion para recuperar datos del caché si existen y no han expirado
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

// Funcion para guardar datos en el caché con un TTL de 30 minuto
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


export const getMealsByCategoryWithCache = async (category:any) :Promise<Meal[]>=> {
  const cacheKey = getCacheKey('category', category);
  const cachedData = await getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const { data } = await axios.get(
    `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
  );
  
  await saveToCache(cacheKey, data.meals || []);
  return data.meals || [];
};


export const getCharacters = async() => {

  //const speciesId = event.pathParameters.speciesId || 1;
  const speciesId = "1";
    // Obtener datos de la especie con el API de Star Wars (SWAPI)
   try {
    
    const species = await getSpeciesWithCache(speciesId);


    // Obtener tipo de dieta y categorías por la clasificacion de la especie
    const dietType = getDietType(species.classification);
  
 
    // Obtener comidas por categoría
    const meals = await Promise.all(
      dietType.categories.map(async (category:string) => {
        try {
          return await getMealsByCategoryWithCache(category);
        } catch {
          return [];
        }
      })
    );

    // Aplanar el array de comidas y tomar los primeros 5 elementos
    const mealsList = meals
      .flat()
      .slice(0, 5);

    // Obtener detalles de comidas con caché
    const detailedMeals = await Promise.all(
      mealsList.map(async (meal) => {   
        try {
          const mealDetails = await getMealDetailsWithCache(meal.idMeal);
          return formatMeal(mealDetails);
        } catch {
          return null;
        }
      })
    );
    const id = uuidv4();
    const newPeople: NewPerson = {
      id,
      speciesId: species.url.split('/').slice(-2)[0],
      name: species.name,
      classification: species.classification,
      dietType: dietType.type,
      recommendedMeals: detailedMeals.filter(meal => meal !== null),
      createdAt: new Date().toISOString()
    };
    
    const params = {
      TableName: 'PeoplesTable',
      Item: newPeople,
    };

    await dynamodb.put(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(newPeople),
      };
   } catch (error:any) {
    return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
   }
}

export const getMealDetailsWithCache = async (mealId:string) => {
  const cacheKey = getCacheKey('meal', mealId);
  const cachedData = await getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const { data } = await axios.get(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
  );
  
  await saveToCache(cacheKey, data.meals[0]);
  return data.meals[0];
};

export const getSpeciesWithCache = async (speciesId:string) : Promise<Species> => {
  const cacheKey = getCacheKey('species', speciesId);
  const cachedData = await getFromCache(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  const { data: species } = await axios.get(
    `https://swapi.dev/api/species/${speciesId}`
  );
  
  await saveToCache(cacheKey, species);
  return species;
};

module.exports = {
    getCharacters
}