
/**
 * Funcion para obtener una key basado en el type y el id
 * @param type 
 * @param id 
 * @returns 
 */
export const getCacheKey = (type:string, id:string) => `${type}_${id}`;