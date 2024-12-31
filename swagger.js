
const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        openapi: '3.0.0',
        title: 'Book store ',
        description: 'API documentation for managing books, ',
    },
   // host: 'localhost:3001',
   servers: [{ url: 'http://localhost:9000' }],
    schemes: ['https'], 
};

const outputFile = './swagger-output.json'; 
const endpointsFiles = ['./routes/*.js']; 


swaggerAutogen(outputFile, endpointsFiles, doc);