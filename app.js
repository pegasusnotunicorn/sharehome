const express = require('express');
const http = require('http');
const path = require('path');
const port = process.env.PORT || '8080';
const socketIo = require("socket.io");
const session = require('express-session');
let app = express();

//socket.io stuff
const server = http.createServer(app);
const io = socketIo(server, {
	path: "/socket-io",
	pingTimeout: 30000
});

//cookie session for both express and socket.io
const { v4: uuidv4 } = require('uuid');
const sessionMiddleware = session({
	secret: 'sharehome awesome game',
	cookie: { maxAge: 24 * 60 * 60 * 1000 },		//1 day
	resave: true,
	saveUninitialized: true,
});
app.use(sessionMiddleware);
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

let rooms = {};

//new connection, check for session ID, if not create one
io.on("connection", (socket) => {
	let session = socket.request.session;
	// console.log("new socket connection ------ " + session.id);

	socket.on("disconnect", () => {
		// console.log("socket was disconnected");
		leaveRoom(socket, session.user.currentRoom);
	});

	//<editor-fold>-----------SESSION STUFF (IF DID SOMETHING AND REFRESHED)

	//session data exists
	if (!session.user){
		session.user = {
			id: session.id,
			username: "Guest",
		}
	}
	socket.user = session.user;
	socket.emit("heres_existing_user", session.user);

	//join existing room
	if (session.user.currentRoom){
		joinRoom(socket, session.user.currentRoom);
	}

	//</editor-fold>

	//<editor-fold>-----------LISTEN STUFF (AND SAVE TO SESSION)

	//update username on session data
	socket.on("im_changing_existing_user", (data) => {
		console.log("changing session user info");

		//update room object with new user data
		if (session.user.currentRoom){
			let currentRoomPlayers = rooms[session.user.currentRoom].players;
			let playerIndex = currentRoomPlayers.findIndex((elem) => {
				return elem.id === session.user.id;
			});
			if (playerIndex >= 0){
				currentRoomPlayers[playerIndex].username = data.username;
			}
		}

		//emit to the whole room
		emitRoomDataToRoom(session.user.currentRoom);

		//update user session info
		let tempData = {
			username: data.username
		}
		updateSocketSession(socket, session, tempData);
	});

	//create a new room and join it
	socket.on("im_joining_room", (roomName) => {
		if (roomName !== "" && roomName){

			//only if not already in that room
			if (session.user.currentRoom !== roomName){

				//if in a room already, leave first
				if (typeof session.user.currentRoom === "string"){
					leaveRoom(socket, session.user.currentRoom, () => {
						console.log("joining room - " + roomName);
						updateSocketSession(socket, session, { currentRoom: roomName });
						joinRoom(socket, roomName);
					});
				}
				else {
					console.log("joining room - " + roomName);
					updateSocketSession(socket, session, { currentRoom: roomName });
					joinRoom(socket, roomName);
				}
			}
		}
	});

	//create a new room and join it
	socket.on("im_exiting_room", (roomName) => {
		if (roomName !== "" && roomName && rooms[roomName]){
			console.log("leaving room - " + roomName);
			updateSocketSession(socket, session, { currentRoom: null });
			leaveRoom(socket, roomName);
		}
	});

	//get all rooms available
	socket.on("give_me_rooms", () => {
		socket.emit("heres_available_rooms", rooms);
	});

	//</editor-fold>

});

function updateSocketSession(socket, session, newData){
	let tempUser = {...session.user};
	for (let x in newData){
		tempUser[x] = newData[x];
	}

	session.user = tempUser;
	session.save();
	socket.user = tempUser;
}

//join a room, then emit to all members of that room all members
function joinRoom(socket, roomName, cb){
	socket.join(roomName, () => {

		//if the room exists already
		if (rooms[roomName]){
			rooms[roomName].players.push({
				id:socket.user.id,
				username:socket.user.username,
			});
		}
		//creating a new room
		else {
			rooms[roomName] = {
				players:[{
					id:socket.user.id,
					username:socket.user.username
				}],
				createdOn:new Date(),
				roomName:roomName
			}
		}

		emitRoomDataToRoom(roomName, cb);
	});
}

//leave a room, then emit to all members of that room all members
function leaveRoom(socket, roomName, cb){
	socket.leave(roomName, () => {

		//edit room data
		if (rooms[roomName]){
			if (rooms[roomName].players && rooms[roomName].players.length <= 1){
				delete rooms[roomName];
			}
			else {
				let tempPlayers = rooms[roomName].players;
				rooms[roomName].players = tempPlayers.filter((elem) => {
					return elem.id !== socket.user.id;
				});
			}
		}

		emitRoomDataToRoom(roomName, cb);
	});
}

//emits room details to people in the room
function emitRoomDataToRoom(roomName, cb){
	if (roomName && rooms[roomName]){
		io.sockets.in(roomName).emit("heres_room_data", rooms[roomName]);
	}

	//callback if needed
	if (cb){
		cb();
	}
}

//express will serve up build folder
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static('build'));
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

//run server
app.set('port', port);
server.listen(port, () => console.log(`SHAREHOME server now running on localhost:${port}`));
