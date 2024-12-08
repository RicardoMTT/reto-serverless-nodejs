const axios = require('axios');
import { API_THEMEALDB } from "../getData";
import { Meal } from "../interfaces/meal.interface";
import { getCacheKey } from "./get-cache";
import { getFromCache } from "./get-data-cache";
import { saveToCache } from "./save-to-cache";

/**
 * Función para obtener comidas por categoría con caché
 * @param category 
 * @returns 
 */
export const getMealsByCategoryWithCache = async (category:any) :Promise<Meal[]>=> {
    const cacheKey = getCacheKey('category', category);
    const cachedData = await getFromCache(cacheKey);
    
    // Consulta primero el caché antes de hacer la llamada a la API
    if (cachedData) {
      return cachedData;
    }
    const { data } = await axios.get(
      `${API_THEMEALDB}/filter.php?c=${category}`
    );
    
    await saveToCache(cacheKey, data.meals || []);
    return data.meals || [];
  };