import React, { useState, useEffect } from "react";
import { NavLink } from 'react-router-dom';
import { ArrowLeft, Plus } from 'react-feather';

import ConfirmModalButton from '../utils/ConfirmModalButton.js';

import '../../css/Play/roomCreator.css';

const RoomCreator = (props) => {
  const [newRoomName, setNewRoomName] = useState("");

  let emitJoinRoom = props.emitJoinRoom;

  useEffect(() => {
    document.title = "SHAREHOME - Create a room";
  });

  function createRoom(e){
    if (newRoomName !== ""){
      emitJoinRoom(newRoomName);
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
        <div className="roomCreatorButtonWrapper">
          <input
            type="text"
            className="input createRoomInput"
            placeholder="Enter new room name"
            value={newRoomName}
            onChange={(e)=>{setNewRoomName(e.target.value)}}
          />
          <ConfirmModalButton
            className="noselect button"
            onClick={createRoom}
            icon={<Plus />}
            text="Create room"
            modalText={`Are you sure you want to create this room? You will leave any room you are currently in.`}
          />
        </div>
      </div>
    </>
  )
}


export default RoomCreator;
