import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { saveUser } from './saveData';

// Mock AWS SDK
jest.mock('aws-sdk', () => { 
    const mDocumentClient = { 
        put: jest.fn() 
    }; 
    return { 
        DynamoDB: { 
            DocumentClient: jest.fn(() => mDocumentClient) 
        } 
    }; 
});


jest.mock('uuid', () => ({
  v4: jest.fn()
}));

describe('saveUser', () => {
  let mockDynamoDb : any;

  beforeEach(() => {
    // Crear una nueva instancia del mock para cada prueba
    mockDynamoDb = new AWS.DynamoDB.DocumentClient(); 
    // Limpiar todos los mocks antes de cada prueba 
    jest.clearAllMocks();
  });

  it('Debe guardar un usuario válido en DynamoDB', async () => {
    const mockUuid = '1234-5678-91011';
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    mockDynamoDb.put.mockImplementationOnce(() => ({
      promise: () => Promise.resolve({})
    }));

    const event = {
      body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
    } as any;

    const response = await saveUser(event);

    expect(mockDynamoDb.put).toHaveBeenCalledTimes(1);
    expect(mockDynamoDb.put).toHaveBeenCalledWith({
      TableName: 'UsersTable',
      Item: {
        id: mockUuid,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: expect.any(String)
      }
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toEqual({
      id: mockUuid,
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: expect.any(String)
    });
  });

  it('Debe devolver un error 400 si faltan campos requeridos', async () => {
    const event = {
      body: JSON.stringify({ name: '' })
    } as any;

    const response = await saveUser(event);

    expect(mockDynamoDb.put).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('Name and email are required fields');
  });

  it('Debe manejar errores de DynamoDB y devolver un error 500', async () => {
    mockDynamoDb.put.mockImplementationOnce(() => ({
      promise: () => Promise.reject(new Error('DynamoDB Error'))
    }));

    const event = {
      body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com' })
    } as any;

    const response = await saveUser(event);

    expect(mockDynamoDb.put).toHaveBeenCalledTimes(1);
    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.error).toBe('DynamoDB Error');
  });
});
