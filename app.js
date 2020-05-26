const express = require('express');
const http = require('http');
const path = require('path');
const port = process.env.PORT || '8080';

//express will serve up production assets
let app = express();
app.use(express.static(path.join(__dirname, 'build')));

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('build'));
}

//express serve up index.html file if it doesn't recognize route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));
