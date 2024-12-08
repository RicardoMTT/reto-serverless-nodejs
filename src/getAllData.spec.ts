import { getAll } from './getAllData';
import AWS from 'aws-sdk';

// Mock AWS SDK
jest.mock('aws-sdk', () => {
  const mDocumentClient = {
    scan: jest.fn()
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mDocumentClient)
    }
  };
});

describe('getAll', () => {
  let mockDynamoDb : any;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();

    // Crear una nueva instancia del mock para cada prueba
    mockDynamoDb = new AWS.DynamoDB.DocumentClient();
  });

  it('debe devolver elementos paginados correctamente', async () => {
    // Mock para el conteo
    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Count: 20 })
    }));
    
    // Mock para los items
    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Items: generateMockItems(20) })
    }));

    const event = {
      queryStringParameters: { limit: '5', page: '2' }
    };

    const response = await getAll(event);

    expect(mockDynamoDb.scan).toHaveBeenCalledTimes(2);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.items).toHaveLength(5);
    expect(body.pagination).toEqual({
      totalItems: 20,
      totalPages: 4,
      currentPage: 2,
      itemsPerPage: 5,
      hasNextPage: true,
      hasPreviousPage: true
    });
  });

  it('debe devolver un error si la página solicitada no existe', async () => {
    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Count: 10 })
    }));

    const event = {
      queryStringParameters: { limit: '5', page: '5' }
    };

    const response = await getAll(event);

    expect(mockDynamoDb.scan).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.message).toBe('La página solicitada no existe. Total de páginas: 2');
  });

  it('debe devolver todos los elementos con paginación por defecto si no se especifican parámetros', async () => {
    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Count: 15 })
    }));

    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Items: generateMockItems(15) })
    }));

    const event = { queryStringParameters: null };

    const response = await getAll(event);

    expect(mockDynamoDb.scan).toHaveBeenCalledTimes(2);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.items).toHaveLength(10);
    expect(body.pagination).toEqual({
      totalItems: 15,
      totalPages: 2,
      currentPage: 1,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPreviousPage: false
    });
  });

  it('debe devolver un array vacío si no hay elementos en la tabla', async () => {
    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Count: 0 })
    }));

    mockDynamoDb.scan.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({ Items: [] })
    }));

    const event = { queryStringParameters: { limit: '5', page: '1' } };

    const response = await getAll(event);

    expect(mockDynamoDb.scan).toHaveBeenCalledTimes(2);
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.items).toHaveLength(0);
    expect(body.pagination).toEqual({
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 5,
      hasNextPage: false,
      hasPreviousPage: false
    });
  });
});

// Función auxiliar para generar elementos mock
function generateMockItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index + 1}`,
    createdAt: new Date(Date.now() - index * 1000).toISOString()
  }));
}
