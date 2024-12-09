<!--
title: 'AWS Simple HTTP Endpoint example in NodeJS'
description: 'This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda and API Gateway using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Reto técnico backend

API REST desarrollada con Serverless Framework que combina datos de Star Wars (SWAPI) con una API de comidas (TheMealDB) para crear recomendaciones de dietas basadas en la clasificación biológica de las especies de Star Wars.

## Caracteristicas principales

* Integración de SWAPI y TheMealDB APIs
* Sistema de caché con DynamoDB (TTL: 30 minutos)
* Almacenamiento persistente en DynamoDB
* Pruebas unitarias usando Gherkin
  
### Despliegue

Para desplegar cambios ejecute el siguiente comando
```
serverless deploy
```

### Pruebas

Para ejecutar las pruebas a nuestros endpoints podemos ejecutar el comando
```
npm test
```

### Manejo de la caché

Para el sistema de cache se necesitará crear una nueva tabla en DynamoDB, esta 
tabla se llamará ApiCache para almacenar las respuestas en caché.

* Implementado usando DynamoDB con TTL
* Tiempo de caché: 30 minutos
* Clave de caché: Combinación de tipo y ID
* Tabla ApiCache

### Optimización de costos

Como practicas recomendada tenemos que reducir el uso de timeout ya que al tener
un timeout bajo esto reduciria los costos ya que se paga por el tiempo de cada ejecucion.
```
saveData:
    handler: src/saveData.saveUser
    timeout: 6
    events:
      - httpApi:
          path: /almacenar
          method: post
```
En este metodo le pusimos 6 segundos ya que realiza un proceso que deberia ser rapido, en cambio a esta
```
getData:
    handler: src/getData.getCharacters
    timeout: 15
    events:
      - httpApi:
          path: /fusionados
          method: get
```
le pusimos un timeout de 15 segundos porque es una funcion un poco mas compleja porque hace llamadas a APIs externas.
Otra practica seria el uso de caché para reducir llamadas API, esto lo hacemos creando una tabla de dynamoDb llamada ApiCache.


### Endpoints

Documentación [URL](https://wfw96bgzai.execute-api.us-east-1.amazonaws.com/fusionados](https://prueba-9731.postman.co/workspace/prueba-Workspace~54439b17-c3a4-4ca1-976e-9676ebd89cc5/collection/19277596-3b22f0b9-5cf0-4b7f-90fa-cc2876d16e16?action=share&creator=19277596&action_performed=login)).

#### Fusionados
Obtiene y fusiona datos de especies de Star Wars con recomendaciones de comidas [URL](https://wfw96bgzai.execute-api.us-east-1.amazonaws.com/fusionados).
```
  GET /fusionados
```

#### Almacenar
Permite almacenar información personalizada (no relacionada con las APIs externas) en la base de datos [URL](https://wfw96bgzai.execute-api.us-east-1.amazonaws.com/almacenar).
```
  POST /almacenar
  {
    "name":"test",
    "email":"test@gmail.com"
  }
```

#### Historial
Retorna el historial de todas las respuestas almacenadas por el endpoint/fusionados, ordenado cronológicamente y paginado [URL](https://wfw96bgzai.execute-api.us-east-1.amazonaws.com/historial).

```
  GET /historial:
```
