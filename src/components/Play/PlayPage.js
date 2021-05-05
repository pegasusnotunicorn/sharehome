import React, { useState, useEffect, useCallback, useRef } from "react";
import { NavLink, Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import { RefreshCw } from 'react-feather';
import io from 'socket.io-client';

import RoomCreator from './RoomCreator.js';
import RoomSelector from './RoomSelector.js';
import Room from './Room/Room.js';
import { errorCodes } from '../utils/errorCodes.js';
import { useStickyReducer } from '../utils/stickyHooks.js';
import { reducerForArrays } from '../utils/reducers.js';
import Modal from '../utils/Modal.js';

const isDev = process.env.NODE_ENV === 'development';
const ENDPOINT = "ws://localhost:3000";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function getRoomByName(rooms, roomName){
  for (let x = 0; x < rooms.length ; x++){
    if (rooms[x].roomName === roomName){
      return rooms[x];
    }
  }
  return false;
}

const PlayPage = (props) => {
  const [currentSocket, setCurrentSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [displayMessage, setDisplayMessage] = useState("");

  const [rooms, dispatchRooms] = useStickyReducer(reducerForArrays, [], "rooms");
  const [currentRoomName, setCurrentRoomName] = useState(false, "currentRoomName");

  const history = useHistory();
  const query = useQuery();
  let queryRoomName = query.get("room");

  useEffect(() => {
    document.title = "SHAREHOME - Play now!";

    //connect to socket.io
    const socket = (isDev)
      ? io(ENDPOINT, { path: '/socket-io' })
      : io({ path: '/socket-io' });
    setCurrentSocket(socket)

    //any error messages
    socket.on("error_code", (data) => {
      setDisplayMessage(errorCodes[data]);
    });

    //any existing info on session
    socket.on("heres_existing_user", (data) => {
      console.log("existing user session data", data);
      if (data){
        setCurrentUser(data);
      }
    });

    //get all existing rooms
    socket.on("heres_available_rooms", (data) => {
      console.log("receiving all available rooms", data);
      dispatchRooms({
        type:"replace",
        item:data
      });
    });

    //get room data about current room
    socket.on("heres_room_data", (data) => {
      console.log("receiving room specific data", data);
      setCurrentRoomName(data.roomName);
      dispatchRooms({
        type:"add",
        item:data,
      });
    });

    return () => { socket.disconnect() }
  }, [dispatchRooms]);

  //go to room if currentroom exists and only if currentRoomName changes to something new
  const previousRoomName = useRef(currentRoomName);     //what currentRoomName was before changing
  useEffect(() => {
    if (currentRoomName !== previousRoomName && getRoomByName(rooms, currentRoomName)){
      history.push("/play?room=" + currentRoomName);
    }
  }, [rooms, currentRoomName, history]);

  //emit that i am joining a room
  const emitJoinRoom = useCallback((roomObj, create) => {
    console.log("im joining room");
    let emitText = (create) ? "im_creating_room" : "im_joining_room";
    currentSocket.emit(emitText, roomObj);
  }, [currentSocket]);

  //emit that i am leaving a room
  const emitExitRoom = useCallback(() => {
    console.log("im exiting room");
    currentSocket.emit("im_exiting_room", currentRoomName);
    setCurrentRoomName(false);
    history.push("/play");
  }, [currentRoomName, currentSocket, history]);

  //for when you copy paste url link and send to someone (they load rooms and join automatically)
  useEffect(() => {
    if (currentSocket && queryRoomName && !currentRoomName){
      emitJoinRoom({
        roomName:queryRoomName
      });
    }
  }, [emitJoinRoom, currentSocket, queryRoomName, currentRoomName])

  //tries to prevent refresh when current room is defined
  useEffect(() => {
    if (typeof currentRoomName === "string") window.onbeforeunload = () => {return true};
    return () => { window.onbeforeunload = undefined }
  });

  return (
    <div className="content">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <Switch>
        <Route exact path="/play/create" render={()=>{
          return (
            <RoomCreator
              emitJoinRoom={emitJoinRoom}
              setDisplayMessage={setDisplayMessage}
            />
          )
        }} />
        <Route exact path="/play" render={()=>{
          //no url query so show selector
          if (!queryRoomName){
            return (
              <RoomSelector
                rooms={rooms}
                currentSocket={currentSocket}
                setCurrentRoomName={setCurrentRoomName}
                emitJoinRoom={emitJoinRoom}
              />
            )
          }
          //rooms exists so check if the room exists
          else if (rooms.length > 0){
            return (
              <Room
                currentUser={currentUser}
                rooms={rooms}
                queryRoomName={queryRoomName}
                currentRoomName={currentRoomName}
                emitJoinRoom={emitJoinRoom}
                emitExitRoom={emitExitRoom}
              />
            )
          }
          //display loading for going into a room while waiting for rooms object to load
          else {
            return (
              <div className="subcontentWrapper">
                <h1>Now loading room info...</h1>
                <p><RefreshCw className="is-spinning is-48" /></p>
                <p>If this is taking too long, please <NavLink to="/play">click here</NavLink> to go back to the list of available rooms and try joining again.</p>
              </div>
            )
          }
        }} />
        <Redirect to="/play" />
      </Switch>
      { (displayMessage !== "") &&
        <Modal
          showModal={(displayMessage !== "")}
          setShowModal={()=>{setDisplayMessage("")}}
          showCancel={false}
          modalText={displayMessage}
          confirmText="Got it"
        />
      }
    </div>
  )
}

// <div className="subcontentWrapper border-top">
//   <h3>Set user details</h3>
//   <input
//     type="text"
//     className="input playpageInput"
//     placeholder="Enter your username"
//     value={username}
//     onChange={(e)=>{setUsername(e.target.value)}}
//   />
//   <button
//     className="button"
//     onClick={(e)=>{
//       if (username !== ""){
//         console.log("im changing my user info");
//         currentSocket.emit("im_changing_existing_user", { username: username });
//       }
//     }}
//   >
//     Set username
//   </button>
// </div>


export default PlayPage;
