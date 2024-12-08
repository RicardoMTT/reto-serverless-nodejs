const axios = require('axios');
import { API_THEMEALDB } from "../getData";
import { getCacheKey } from "./get-cache";
import { getFromCache } from "./get-data-cache";
import { saveToCache } from "./save-to-cache";

/**
 * Función para obtener detalles de una comida específica con caché
 * @param mealId 
 * @returns 
 */
export const getMealDetailsWithCache = async (mealId:string) => {
    const cacheKey = getCacheKey('meal', mealId);
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
  
    const { data } = await axios.get(
      `${API_THEMEALDB}/lookup.php?i=${mealId}`
    );
    
    await saveToCache(cacheKey, data.meals[0]);
    return data.meals[0];
  };