/*********** Dependencies ************/
const config = require('./config');
const { checkAuthentication } = require('./middlewares');

// Globals 
const PORT = config.port;
const Server = require('./server');

// Instantiate the server class
const app = new Server();

// Run Middlewares
app.use(checkAuthentication);

// Start the server
app.createServer();
app.listen(PORT, () => console.log(`Listening on ${PORT}`));