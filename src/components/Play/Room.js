import React, { useEffect } from "react";
import { NavLink, Redirect } from 'react-router-dom';
import { ArrowLeft, User, XCircle, Settings } from 'react-feather';

import ConfirmModalButton from '../utils/ConfirmModalButton.js';
import '../../css/Play/room.css';

const Room = (props) => {
  let rooms = props.rooms;
  let currentRoomName = (props.currentRoomName) ? props.currentRoomName : props.queryRoomName;
  let emitExitRoom = props.emitExitRoom;

  let currentRoom = rooms[currentRoomName];

  useEffect(() => {
    if (currentRoom){
      document.title = `SHAREHOME - ${currentRoom.roomName}`;
    }
  });

  //room info doesnt exist, go back to selector
  if (!currentRoomName || !currentRoom){
    return <Redirect to="/play" />
  }
  else {
    return (
      <>
        <div className="subcontentWrapper">
          <h2 className="subtitle">
            <NavLink className="subtitleBackPageArrow" to="/play"><ArrowLeft /></NavLink>
            Now in room - {currentRoom.roomName}
          </h2>
        </div>
        <div className="subcontentWrapper">
          <div className="noselect roomButtonWrapper">
            <ConfirmModalButton
              className="noselect button is-bordered"
              onClick={emitExitRoom}
              icon={<XCircle />}
              text="Leave room"
              modalText={`Are you sure you want to leave this room? If you are the last person leaving, the room will be deleted.`}
            />
            <button className="button is-bordered">
              <User />
              Edit User Details
            </button>
            <button className="button is-bordered">
              <Settings />
              Settings
            </button>
          </div>
        </div>
        <div className="subcontentWrapper">
          <Table players={currentRoom.players}/>
        </div>
      </>
    )
  }
}

//create a representation of the table
const Table = (props) => {
  const PlayersList = props.players.map((elem, index) => {
    return (
      <div key={"player" + index}>
        {elem.username}
      </div>
    )
  });

  return (
    <div className="table">
      { PlayersList }
    </div>
  )
}

export default Room;
