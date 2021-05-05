import React, { useState, useEffect, useRef } from "react";
import { NavLink } from 'react-router-dom';
import { Home, Users } from 'react-feather';

import { ExistingRowsHeader, LoadingRow, NoRoomsRow } from '../utils/TableRows.js';

import '../../css/Play/roomSelector.css';

const RoomSelector = (props) => {
  let rooms = props.rooms;
  let totalRoomCount = rooms.length;
  let currentSocket = props.currentSocket;
  let emitJoinRoom = props.emitJoinRoom;
  let setCurrentRoomName = props.setCurrentRoomName;

  function getRooms(){
    if (currentSocket){
      currentSocket.emit("give_me_rooms");
    }
    setLoadingRows(true);
  }

  //give me all rooms when rendering the room selector
  const [loadingRows, setLoadingRows] = useState(true);
  useEffect(() => {
    document.title = "SHAREHOME - Play now!";
    if (currentSocket){
      currentSocket.emit("give_me_rooms");
    }
    setCurrentRoomName(false);
  }, [currentSocket, setCurrentRoomName]);

  //not loading anymore if rooms changes (dont run on first render to prevent load screen flash)
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current){
      firstRender.current = false;
      return;
    }
    setLoadingRows(false);
  }, [firstRender, rooms]);

  return (
    <>
      <div className="subcontentWrapper border-bottom">
        <h2 className="subtitle">Play now!</h2>
        <p><NavLink to="/play/create">Create a new room</NavLink> and invite your friends or click on an existing room below to join and play with strangers on the internet!</p>
        <p>For more details on how to play, visit the <NavLink to="/about">How to Play page</NavLink>.</p>
      </div>
      <div className="subcontentWrapper max-width">
        <h3>
          Existing rooms
        </h3>
        <ExistingRowsHeader
          onRefresh={getRooms}
          link={"/play/create"}
          linkText={"+ Create a new room"}
        />
        { loadingRows
          ? <LoadingRow loadingMessage={"Now loading rooms..."}/>
          : (totalRoomCount > 0)
            ? (
              <ExistingRooms
                rooms={rooms}
                emitJoinRoom={emitJoinRoom}
              />
            )
            : (
              <NoRoomsRow
                noRowsMessage={"There are no available public rooms."}
                link={"/play/create"}
              />
            )
        }
      </div>
    </>
  )
}

//rows of existing room data
const ExistingRooms = (props) => {
  let rooms = props.rooms;
  let emitJoinRoom = props.emitJoinRoom;

  return rooms.map((elem, index) => {
    let iteratingRoom = elem;
    let totalPlayers = (iteratingRoom.players.length + " player") + ((iteratingRoom.players.length > 1 || iteratingRoom.players.length === 0) ? "s" : "");
    return (
      <div
        className="selectorRow noselect"
        key={"room" + index}
        onClick={()=>{
          emitJoinRoom({
            roomName:iteratingRoom.roomName
          });
        }}
      >
        <div className="selectorCell roomSelectorCell">
          <Home />
          <p>{iteratingRoom.roomName}</p>
          { iteratingRoom.description &&
            <p className="roomSelectorDescription">{iteratingRoom.description}</p>
          }
        </div>
        <div className="selectorCell">
          <Users /><p className="margin-right">{totalPlayers}</p>
          <p className="margin-right">
            {
              new Intl.DateTimeFormat({
                year: "numeric",
                month: "long",
                day: "2-digit"
              }).format(new Date(iteratingRoom.createdOn))
            }
          </p>
        </div>
      </div>
    )
  });
}

export default RoomSelector;
