import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Plus } from 'react-feather';

import { errorCodes } from '../utils/errorCodes.js';

import '../../css/Play/roomCreator.css';

const RoomCreator = (props) => {
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newRoomPassword, setNewRoomPassword] = useState("");

  let emitJoinRoom = props.emitJoinRoom;
  let setDisplayMessage = props.setDisplayMessage;

  useEffect(() => {
    document.title = "SHAREHOME - Create a room";
  });

  function createRoom(e){
    if (newRoomName === ""){
      setDisplayMessage(errorCodes["empty_room_name"]);
    }
    else if (newRoomPrivate && newRoomPassword === ""){
      setDisplayMessage(errorCodes["empty_password"]);
    }
    else {
      emitJoinRoom({
        roomName:newRoomName,
        description:newRoomDescription,
        password:newRoomPassword,
      }, true);   //true for creating a new room
    }
  }

  return (
    <>
      <div className="subcontentWrapper border-bottom">
        <h2 className="subtitle">
          <NavLink className="subtitleBackPageArrow" to="/play"><ArrowLeft /></NavLink>
          Create your own room
        </h2>
        <p>Create a new private room for you and your friends to play with your own <NavLink to="/designer">custom cards</NavLink>! Or make a public room and play with anyone who joins!</p>
        <p>Voice chat / messaging is not included with the room and is required to play.</p>
        <p>For more details on how to play, visit the <NavLink to="/about">How to Play page</NavLink>.</p>
      </div>
      <div className="subcontentWrapper">
        <h3>Enter room details below</h3>
        <div className="roomCreatorRow">
          <p>Room Name<span>(Required)</span></p>
          <div className="roomCreatorButtonWrapper">
            <input
              type="text"
              className="input createRoomTextInput"
              placeholder="My awesome room"
              value={newRoomName}
              onChange={(e)=>{setNewRoomName(e.target.value)}}
            />
          </div>
        </div>
        <div className="roomCreatorRow">
          <p>Room Description</p>
          <div className="roomCreatorButtonWrapper">
            <input
              type="text"
              className="input createRoomTextInput"
              placeholder="Come play some Guess who?"
              value={newRoomDescription}
              onChange={(e)=>{setNewRoomDescription(e.target.value)}}
            />
          </div>
        </div>
        <div className="roomCreatorRow">
          <input onChange={()=>{
            setNewRoomPrivate(!newRoomPrivate);
          }} className="createRoomBoxInput" type="checkbox" id="newRoomPrivate" name="newRoomPrivate" checked={newRoomPrivate}></input>
          <label className="noselect" htmlFor="newRoomPrivate">Private room</label>
        </div>
        { newRoomPrivate
          && (
            <div className="roomCreatorRow">
              <p>Password<span>(Required)</span></p>
              <div className="roomCreatorButtonWrapper">
                <input
                  type="password"
                  className="input createRoomTextInput"
                  placeholder=""
                  value={newRoomPassword}
                  onChange={(e)=>{setNewRoomPassword(e.target.value)}}
                />
              </div>
            </div>
          )
        }
        <div className="roomCreatorButtonWrapper">
          <button
            className="noselect button"
            onClick={createRoom}
          >
            <Plus />
            Create Room
          </button>
        </div>
      </div>
    </>
  )
}


export default RoomCreator;
