// Imports the json-server module, which provides a web server and data store for serving JSON data over HTTP.
const jsonServer = require('json-server');

// Creates a new JSON Server instance.
const server = jsonServer.create();

// Creates a new JSON Server router instance and sets the default database file to db.json
const router = jsonServer.router('db.json');

// Creates a middleware instance with the default JSON Server middleware functions
const defaultMiddleware = jsonServer.defaults();

// Imports a custom middleware module and creates a middleware instance with the router instance passed as an argument.
const customMiddleware = require('./middleware');

// Reads the port number from the PORT environment variable, or uses a default of 3000.
const port = process.env.PORT || 3000;

// Specifies the hostname to bind the server to. 
// In this case, it's set to 0.0.0.0, which means that the server will listen on all available network interfaces.
const hostname = '0.0.0.0';

// Specifies the maximum length of the queue of pending connections that the server can handle. 
// In this case, it's set to 1500.
const backlog = 1500;

// Add these lines to enable the body-parser middleware
const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

// Adds the default JSON Server middleware functions to the server.
server.use(defaultMiddleware);

// Adds the custom middleware functions to the server.
server.use(customMiddleware.entitiesFilteringMiddleware(router));
server.use(customMiddleware.dataFormResponsesFilteringMiddleware(router));
server.use(customMiddleware.bulkInsertDataFormResponsesMiddleware(router));

// Uses the JSON Server router to handle incoming requests.
server.use(router);

// Starts the server and listens for incoming requests on the specified port and hostname. 
// Once the server is started, it logs a message to the console indicating that the server is running.
server.listen(port, hostname, backlog, () => {
  console.log(`JSON Server is running on port ${port}`);
});

