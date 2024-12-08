const axios = require('axios');
import { API_SWAPI } from "../getData";
import { Species } from "../interfaces/species.interface";
import { getCacheKey } from "./get-cache";
import { getFromCache } from "./get-data-cache";
import { saveToCache } from "./save-to-cache";

/**
 * Función para obtener detalles de una especie con caché
 */
export const getSpeciesWithCache = async (speciesId:string) : Promise<Species> => {
    const cacheKey = getCacheKey('species', speciesId);
    const cachedData = await getFromCache(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
  
    const { data: species } = await axios.get(
      `${API_SWAPI}/species/${speciesId}`
    );
    
    await saveToCache(cacheKey, species);
    return species;
  };