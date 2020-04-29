const dotenv = require('dotenv');
dotenv.config();
const http = require('http');
global.cookieParser;
global.cookieParser = require('cookie-parser');

const app = require('./app');
const attachGameSocket = require('./gameSocket');
const PORT = process.env.PORT || 5000;
const server = http.createServer({}, app);
attachGameSocket(server);
server.listen(PORT, function() {
    console.log(`Server running on port ${PORT}!`);
});