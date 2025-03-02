// this file was generated by serverless-auto-swagger
            module.exports = {
  "swagger": "2.0",
  "info": {
    "title": "API de Prueba Serverless",
    "version": "1"
  },
  "paths": {
    "/fusionados": {
      "get": {
        "summary": "getData",
        "description": "",
        "operationId": "getData.get./fusionados",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/almacenar": {
      "post": {
        "summary": "saveData",
        "description": "",
        "operationId": "saveData.post./almacenar",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    },
    "/historial": {
      "get": {
        "summary": "getAllData",
        "description": "",
        "operationId": "getAllData.get./historial",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [],
        "responses": {
          "200": {
            "description": "200 response"
          }
        }
      }
    }
  },
  "definitions": {},
  "securityDefinitions": {},
  "basePath": "/",
  "host": "https://wfw96bgzai.execute-api.us-east-1.amazonaws.com",
  "schemes": [
    "https"
  ]
};