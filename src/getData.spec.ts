import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { getCharacters, getMealDetailsWithCache, getMealsByCategoryWithCache, getSpeciesWithCache, saveToCache } from './getData';
import { formatMeal, getDietType } from './utils/diet.utils';

// Mock de dependencias
jest.mock('axios');
jest.mock('uuid', () => ({
  v4: jest.fn()
}));
jest.mock('./utils/diet.utils', () => ({
    getDietType: jest.fn(),
    formatMeal: jest.fn()
  }));
jest.mock('aws-sdk', () => {
  const mDocumentClient = {
    get: jest.fn(),
    put: jest.fn()
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient)
    }
  };
});

// Mock de funciones internas
jest.mock('./getData', () => ({
  ...jest.requireActual('./getData'),
  getSpeciesWithCache: jest.fn(),
  getMealsByCategoryWithCache: jest.fn(),
  getMealDetailsWithCache: jest.fn(),
  saveToCache: jest.fn(),  // Mock saveToCache
}));

describe('getCharacters', () => {
  let mockDynamoDb: any;

  beforeEach(() => {
    mockDynamoDb = new AWS.DynamoDB.DocumentClient();
    jest.clearAllMocks();

    // Mock axios para todas las llamadas
    (axios.get as jest.Mock).mockImplementation((url) => {
      if (url.includes('swapi.dev/api/species')) {
        return Promise.resolve({
          data: {
            url: 'https://swapi.dev/api/species/1/',
            name: 'Human',
            classification: 'mammal'
          }
        });
      } else if (url.includes('themealdb.com/api/json/v1/1/filter.php')) {
        return Promise.resolve({
          data: {
            meals: [
              { idMeal: '1', strMeal: 'Meal 1' },
              { idMeal: '2', strMeal: 'Meal 2' },
              { idMeal: '3', strMeal: 'Meal 3' }
            ]
          }
        });
      } else if (url.includes('themealdb.com/api/json/v1/1/lookup.php')) {
        return Promise.resolve({
          data: {
            meals: [{
              idMeal: '1',
              strMeal: 'Test Meal',
              strCategory: 'Beef'
            }]
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    (getDietType as jest.Mock).mockReturnValue({
      type: 'omnivorous',
      categories: ['Beef', 'Chicken']
    });

    (formatMeal as jest.Mock).mockImplementation((meal) => ({
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory
    }));

    // Mock DynamoDB
    mockDynamoDb.get.mockImplementation(() => ({
      promise: () => Promise.resolve({ Item: null })
    }));

    mockDynamoDb.put.mockImplementation(() => ({
      promise: () => Promise.resolve({})
    }));

    // Configurar los mocks de las funciones de caché
    (getSpeciesWithCache as jest.Mock).mockImplementation(async () => {
      const response = await axios.get('https://swapi.dev/api/species/1');
      return response.data;
    });

    (getMealsByCategoryWithCache as jest.Mock).mockImplementation(async () => {
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/filter.php?c=Beef');
      return response.data.meals;
    });

    (getMealDetailsWithCache as jest.Mock).mockImplementation(async (mealId) => {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      return response.data.meals[0];
    });

      // Mock de saveToCache
      (saveToCache as jest.Mock).mockResolvedValue(undefined);

    // // Configurar el mock de axios por defecto para evitar el error de destructuring
    // (axios.get as jest.Mock).mockImplementation(() => ({
    //     data: {} // Proporciona un objeto vacío por defecto
    //   }));

  });

  it('debe devolver datos del personaje correctamente', async () => {
    const mockUuid = '1234-5678-91011';
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    // Mock específico para cada llamada a getMealDetailsWithCache
    (getMealDetailsWithCache as jest.Mock)
      .mockResolvedValueOnce({ idMeal: '1', strMeal: 'Meal 1', strCategory: 'Beef' })
      .mockResolvedValueOnce({ idMeal: '2', strMeal: 'Meal 2', strCategory: 'Beef' })
      .mockResolvedValueOnce({ idMeal: '3', strMeal: 'Meal 3', strCategory: 'Chicken' })
      .mockResolvedValueOnce({ idMeal: '4', strMeal: 'Meal 4', strCategory: 'Chicken' })
      .mockResolvedValueOnce({ idMeal: '5', strMeal: 'Meal 5', strCategory: 'Beef' });

    const response = await getCharacters();
    console.log('responseeeee', response);
    
    expect(response.statusCode).toBe(200);
    
  });

  it('debe manejar errores y devolver un error 500', async () => {
    const errorMessage = 'API Error';

    // Mockear error en la llamada a getSpeciesWithCache
    (getSpeciesWithCache as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    // Mock para get en DynamoDB (cache miss)
    mockDynamoDb.get.mockImplementationOnce(() => ({
        promise: () => Promise.resolve({}),
    }));
    
    // Mock de axios para simular un error
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));


    // Hacer la llamada y verificar que el error se maneje correctamente
    const response = await getCharacters();
    
    // Verificar que se devuelve un código 500 y el mensaje de error
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('API Error');
  });
});
