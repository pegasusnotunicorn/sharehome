const { createProxyMiddleware } = require('http-proxy-middleware');

//connect to favicon first cuz WS needs an HTTP request first for sessions
module.exports = function(app) {
  app.use(['/decks', '/decks/*'], createProxyMiddleware('http://localhost:8080'));
  app.use(['**/*.ico', '**/*.jpg', '**/*.jpeg', '**/*.json'], createProxyMiddleware('http://localhost:8080'))
  app.use('/socket-io', createProxyMiddleware('ws://localhost:8080/socket-io'));
};
