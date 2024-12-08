import { v4 as uuidv4 } from 'uuid';
import { NewPerson } from './interfaces/person.interface';
import { getMealsByCategoryWithCache } from './utils/get-meals-category';
import { getMealDetailsWithCache } from './utils/get-meal-details';
import { getSpeciesWithCache } from './utils/get-species-cache';
const { getDietType, formatMeal } = require('./utils/diet.utils');
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
export const CACHE_TTL = 30 * 60; // 30 minutos en segundos
export const API_THEMEALDB = 'https://www.themealdb.com/api/json/v1/1';
export const API_SWAPI = 'https://swapi.dev/api'

/**
 * Función principal que obtiene y procesa los personajes
 * @returns 
 */
export const getCharacters = async() => {

  const speciesId = "1";

   try {
    // Obtiene datos de una especie en la API de starwars
    const species = await getSpeciesWithCache(speciesId);
    
    // Determina el tipo de dieta basado en la clasificación de esa especie
    const dietType = getDietType(species.classification);
  
    // Obtiene comidas para cada categoría de la dieta
    const meals = await Promise.all(
      dietType.categories.map(async (category:string) => {
        try {
          return await getMealsByCategoryWithCache(category);
        } catch {
          return [];
        }
      })
    );

    // Obtiene las 5 primeras comidas
    const mealsList = meals
      .flat()
      .slice(0, 5);

    // Obtiene detalles completos de cada comida
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

module.exports = {
    getCharacters
}