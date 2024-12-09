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
  
### Despliegue

Para desplegar cambios ejecute el siguiente comando
```
serverless deploy
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


### Endpoints
```
  GET /characters
```
Obtiene y fusiona datos de especies de Star Wars con recomendaciones de comidas


```
  POST /almacenar
```
Permite almacenar información personalizada (no relacionada con las APIsexternas) en la base de datos


```
  GET /historial:
```
Retorna el historial de todas las respuestas almacenadas por el endpoint/fusionados, ordenado cronológicamente y paginado.
