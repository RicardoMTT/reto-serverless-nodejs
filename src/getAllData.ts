import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getAll = async(event:any) => {

    // Obtener parámetros de query
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 10; // Elementos por página
    const page = parseInt(queryParams.page) || 1; // Página actual
    
      
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

    // Obtener todos los items y aplicar ordenamiento y paginación en memoria
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
    
    // Preparar la respuesta
    
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