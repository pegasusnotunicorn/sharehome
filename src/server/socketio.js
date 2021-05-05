const socketIo = require("socket.io");

const db = require('./database.js');

let rooms = [];
let io;

module.exports = function(server, sessionMiddleware){

  //create socket.io server
  io = socketIo(server, {
  	path: "/socket-io",
  	pingTimeout: 30000
  });

  //use session middleware for socket.io server
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  //new connection, start listening for shit
  io.on("connection", async (socket) => {

    //<editor-fold>-----------SESSION STUFF (IF DID SOMETHING AND REFRESHED)

    let session = socket.request.session;
  	console.log("new socket connection ------ " + session.id);

  	//session data exists
  	if (!session.user){
  		session.user = {
  			id: session.id,
  			username: "Guest",
  		}
  	}

  	socket.user = session.user;
  	socket.emit("heres_existing_user", session.user);

  	//</editor-fold>

  	//<editor-fold>-----------LISTEN STUFF (AND SAVE TO SESSION)

  	socket.on("disconnect", () => {
  		console.log("socket was disconnected");
  		leaveRoomSocket(socket, session.user.currentRoom);
  	});

  	//get all rooms available
  	socket.on("give_me_rooms", async () => {
      await getRoomsDatabase();
      socket.emit("heres_available_rooms", rooms);
  	});

  	//update username on session data
  	socket.on("im_changing_existing_user", async (data) => {
  		console.log("changing session user info");

  		//update room object with new user data
  		if (session.user.currentRoom){
  			let currentRoomPlayers = getRoomByName(session.user.currentRoom).players;
  			let playerIndex = currentRoomPlayers.findIndex((elem) => {
  				return elem.id === session.user.id;
  			});
  			if (playerIndex >= 0) currentRoomPlayers[playerIndex].username = data.username;
  		}

  		//emit to the whole room
  		emitRoomDataToRoom(session.user.currentRoom);

  		//update user session info
  		let tempData = {
  			username: data.username
  		}
  		updateSocketSession(socket, session, tempData);
  	});

    //join an existing room (even the room you're already in)
  	socket.on("im_joining_room", async (roomObj) => {
      if (!rooms) await getRoomsDatabase();

  		let roomName = roomObj.roomName;

      //empty room
  		if (!roomName || roomName === ""){
        socket.emit("error_code", "empty_room_name");
      }
      //no such room exists
      else if (!roomObj){
        socket.emit("error_code", "no_such_room");
      }
      else {
        //if in a different room already, leave first
        if (typeof session.user.currentRoom === "string" && roomName !== session.user.currentRoom) {
          await leaveRoomSocket(socket, session.user.currentRoom);
        }

        updateSocketSession(socket, session, { currentRoom: roomName });
        joinRoomSocket(socket, roomObj);
      }
  	});

    //create a new room and join it
  	socket.on("im_creating_room", async (roomObj) => {
      if (!rooms) await getRoomsDatabase();

  		let roomName = roomObj.roomName;

      //empty room
  		if (!roomName || roomName === ""){
        socket.emit("error_code", "empty_room_name");
      }
      //room with same name exists
  		else if (getRoomByName(roomName)){
        socket.emit("error_code", "room_name_exists");
      }
      else {
        //if in a different room already, leave first
        if (typeof session.user.currentRoom === "string") {
          await leaveRoomSocket(socket, session.user.currentRoom);
        }

        updateSocketSession(socket, session, { currentRoom: roomName });

        //creating a new room
        await newRoomDatabase({
          roomName:roomName,
          createdOn:new Date(),
          description:roomObj.description,
          players:[],
          password:roomObj.password,
        }, socket);

        joinRoomSocket(socket, roomObj);
      }
  	});

  	//create a new room and join it
  	socket.on("im_exiting_room", async (roomName) => {
      if (!rooms) await getRoomsDatabase();

      //room doesnt exist
  		if (roomName === "" || !roomName || !getRoomByName(roomName)){
        socket.emit("error_code", "leaving_room");
  		}
      else {
        updateSocketSession(socket, session, { currentRoom: null });
        leaveRoomSocket(socket, roomName);
      }
  	});

  	//</editor-fold>

  });

}

// <editor-fold>--------------------------------------------------------------------------------SOCKET IO FUNCTIONS

function getRoomByName(roomName){
  for (let x = 0; x < rooms.length ; x++){
    if (rooms[x].roomName === roomName){
      return rooms[x];
    }
  }
  return false;
}

//update the session data for the socket connection
function updateSocketSession(socket, session, newData){
  console.log("updating socket session");
	let tempUser = {...session.user};
	for (let x in newData){
		tempUser[x] = newData[x];
	}

  socket.user = tempUser;
	session.user = tempUser;
	session.save();
}

//asynchronous function to join a room, then emit to all members of that room all members
async function joinRoomSocket(socket, roomObj){

  return new Promise(resolve => {
    let roomName = roomObj.roomName;
    let currentRoom = getRoomByName(roomName);
    console.log("joining room - " + roomName);

    currentRoom.players.push({
      id:socket.user.id,
      username:socket.user.username,
    });

  	socket.join(roomName, () => {
  		emitRoomDataToRoom(roomName);
      resolve();
  	});
  });
}

//asynchronous function to leave a room, then emit to all members of that room all members
async function leaveRoomSocket(socket, roomName){

  return new Promise(resolve => {
    let currentRoom = getRoomByName(roomName);

    //delete room if last person leaving, otherwise edit room data
    if (currentRoom){
      console.log("leaving room - " + roomName);

      if (currentRoom.players && currentRoom.players.length <= 1){
        deleteRoomDatabase(currentRoom.id);
      }
      else {
        let tempPlayers = currentRoom.players;
        currentRoom.players = tempPlayers.filter((elem) => {
          return elem.id !== socket.user.id;
        });
      }
    }

    socket.leave(roomName, () => {
      emitRoomDataToRoom(roomName);
      resolve();
    });
  });
}

//emits room details to people in the room
function emitRoomDataToRoom(roomName){
  let roomObj = getRoomByName(roomName);
	if (roomName && roomObj){
		io.sockets.in(roomName).emit("heres_room_data", roomObj);
	}
}

//</editor-fold>

// <editor-fold>--------------------------------------------------------------------------------ASYNC DATABASE FUNCTIONS

//catch any errors with database
function errorCatch(err, socket){
  console.log(err);
  if (socket){
    socket.emit("error_code", "database_error");
  }
}

//get all rooms from the database
async function getRoomsDatabase(){
  const results = await db.query('SELECT * FROM rooms WHERE password IS NULL').catch((err)=>{errorCatch(err, socket)});
  const { rows } = results || {};     //destructuring for rows

  if (rows){
    //keep players property
    let newRooms = [];

    outer_loop:
    for (var x = 0 ; x < rows.length ; x++){
      for (var y = 0 ; y < rooms.length ; y++){

        //if players exist already in the room, keep that
        if (
          rows[x].id === rooms[y].id &&
          rooms[y].players &&
          rooms[y].players.length > 0
        ){
          newRooms.push({
            ...rows[x],
            players:rooms[y].players
          });
          break outer_loop;
        }
      }

      //no matching IDs in existing rooms object, database is wrong
      // rows[x].players = [];
      // newRooms.push(rows[x]);
      deleteRoomDatabase(rows[x].id);
    }

    rooms = newRooms;
  }
}

//make a new room in database and update rooms
async function newRoomDatabase(roomObj, socket){
  const sql = 'INSERT INTO rooms("roomName", "createdOn", description, password) VALUES($1, $2, $3, $4) RETURNING id';
  const values = [
    roomObj.roomName,
    roomObj.createdOn,
    roomObj.description,
    (roomObj.password === "") ? null : roomObj.password
  ]
  const results = await db.query(sql, values).catch((err)=>{errorCatch(err, socket)});
  const { rows } = results || {};     //destructuring for rows

  return new Promise(resolve => {

    if (rows){
      //add to rooms obj
      rooms.push({
        ...roomObj,
        id:rows[0].id,
      });
    }

    resolve();
  });
}

//delete in database and in rooms obj
async function deleteRoomDatabase(roomId){
  const sql = 'DELETE FROM rooms WHERE id = $1';
  const values = [roomId]
  db.query(sql, values).catch((err)=>{errorCatch(err, socket)});

  //remove it from rooms obj
  rooms = rooms.filter((item, index) => {
    return item.id !== roomId;
  });
}

//</editor-fold>
