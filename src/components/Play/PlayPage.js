import React, { useState, useEffect, useRef } from "react";
import { NavLink, Switch, Route, Redirect, useHistory, useLocation } from 'react-router-dom';
import { RefreshCw } from 'react-feather';
import io from 'socket.io-client';

import RoomCreator from './RoomCreator.js';
import RoomSelector from './RoomSelector.js';
import Room from './Room.js';
import { useStickyReducer } from '../utils/stickyHooks.js';
import { reducerForObjects } from '../utils/reducerForObjects.js';

const isDev = process.env.NODE_ENV === 'development';
const ENDPOINT = "ws://localhost:3000";

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PlayPage = (props) => {
  const [currentSocket, setCurrentSocket] = useState(null);
  const [username, setUsername] = useState("", "username");

  const [rooms, dispatchRooms] = useStickyReducer(reducerForObjects, {}, "rooms");
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

    //any existing info on session
    socket.on("heres_existing_user", (data) => {
      console.log("existing user session data");
      if (data.username){
        setUsername(data.username);
      }
    });

    //get all existing rooms
    socket.on("heres_available_rooms", (data) => {
      console.log("receiving all available rooms");
      dispatchRooms({
        type:"replace",
        item:data
      });
    });

    //get room data about current room
    socket.on("heres_room_data", (data) => {
      console.log("receiving room specific data");
      dispatchRooms({
        type:"update",
        index:data.roomName,
        item:data,
      });
    });

    return () => { socket.disconnect() }
  }, [dispatchRooms]);

  //to keep track of what currentRoomName was before changing
  const previousRoomName = useRef(currentRoomName);
  //go to room if currentroom exists and if currentRoomName changes to something new
  useEffect(() => {
    if (currentRoomName !== previousRoomName && rooms[currentRoomName]){
      history.push("/play?room=" + currentRoomName);
    }
  }, [rooms, currentRoomName, history]);

  //copy paste url link
  useEffect(() => {
    if (currentSocket && queryRoomName && !currentRoomName){
      emitJoinRoom(queryRoomName);
    }
  }, [currentSocket, queryRoomName, currentRoomName])

  //emit that i am joining a room
  function emitJoinRoom(roomName){
    console.log("im joining room");
    currentSocket.emit("im_joining_room", roomName);
    setCurrentRoomName(roomName);
  }

  //emit that i am leaving a room
  function emitExitRoom(){
    console.log("im exiting room");
    currentSocket.emit("im_exiting_room", currentRoomName);
    setCurrentRoomName(false);
    history.push("/play");
  }

  return (
    <div className="content max-width">
      <NavLink to="/"><div className="title noselect"></div></NavLink>
      <Switch>
        <Route exact path="/play/create" render={()=>{
          return (
            <RoomCreator
              emitJoinRoom={emitJoinRoom}
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
          else if (Object.keys(rooms).length > 0){
            return (
              <Room
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
