import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Esta función recupera elementos paginados de una tabla de DynamoDB
 * llamada PeoplesTable , los elementos vienen ordenados por la propiedad createdAt 
 * y hay un manejo de la paginación.
 * @param event 
 * @returns 
 */
export const getAll = async(event:any) => {

    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 10; 
    const page = parseInt(queryParams.page) || 1; 
      
    // Obtener el total de items para la paginación
    const countResult = await dynamodb.scan({
        TableName: "PeoplesTable",
        Select: 'COUNT'
    }).promise();
 
    const totalItems = countResult.Count!;
    const totalPages = Math.ceil(totalItems / limit);

    // Validar que la página solicitada existe
    if (page > totalPages && totalItems > 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `La página solicitada no existe. Total de páginas: ${totalPages}`
            })
        };
    }

    // Obtener todos los items y aplicar ordenamiento y paginación 
    const result = await dynamodb.scan({
        TableName: "PeoplesTable"
    }).promise();
    
    // Ordenar por fecha descendente
    const sortedItems = result.Items!.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Aplicar paginación
    const startIndex = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(startIndex, startIndex + limit);
    
    // Construyendo respuesta
    const response = {
        items: paginatedItems,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            itemsPerPage: limit,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };


    return {
        statusCode: 200,
        body: JSON.stringify(response),
      };
}

module.exports = {
    getAll
}