const http = require('http');
const path = require('path');
const port = process.env.PORT || '8080';
const multer = require('multer');
const express = require('express');
const upload = multer({ dest: './public/uploads/' });
const bodyParser = require('body-parser')
const session = require('express-session');
const cors = require('cors');

//create server
let app = express();
const server = http.createServer(app);
// app.use(bodyParser.urlencoded({ extended: true }));		//application/xwww-form-urlencoded
// app.use(bodyParser.json());		//application/json
// app.use(upload.any()); 		//formdata

//cookie session for both express and socket.io
// const { v4: uuidv4 } = require('uuid');
// const sessionMiddleware = session({
// 	secret: 'sharehome awesome game',
// 	cookie: { maxAge: 24 * 60 * 60 * 1000 },		//1 day
// 	resave: true,
// 	saveUninitialized: true,
// });
// app.use(sessionMiddleware);

// //start socket.io server
// require('./src/server/socketio.js')(server, sessionMiddleware);
//
// //API for decks
// require('./src/server/decks.js')(app);

//CORS shit
app.use(cors());

//express will serve up build folder
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static('build'));
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

//run server
app.set('port', port);
server.listen(port, () => console.log(`SHAREHOME server now running on localhost:${port}`));
