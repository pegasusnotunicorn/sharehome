import React, { useState, useEffect, useRef } from "react";
import { NavLink } from 'react-router-dom';
import { RefreshCw, Home, Users, Frown } from 'react-feather';

import '../../css/Play/roomSelector.css';

const RoomSelector = (props) => {
  let rooms = props.rooms;
  let totalRoomCount = Object.keys(rooms).length;
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
      <div className="subcontentWrapper is-wider">
        <h3>
          Existing rooms
        </h3>
        <ExistingRoomsHeader
          getRooms={getRooms}
        />
        { loadingRows
          ? <LoadingRows />
          : (totalRoomCount > 0)
            ? (
              <ExistingRooms
                rooms={rooms}
                emitJoinRoom={emitJoinRoom}
              />
            )
            : <NoRoomsRow />
        }
      </div>
    </>
  )
}

const ExistingRoomsHeader = (props) => {
  let getRooms = props.getRooms;

  return (
    <div className="selectorRow headerRow noselect">
      <div className="selectorCell">
        <div className="selectorCellButtonWrapper">
          <RefreshCw
            className="selectorButton"
            onClick={getRooms}
          />
        </div>
      </div>
      <div className="selectorCell">
        <p className="margin-right">
          <NavLink to="/play/create">
            + Create a new room
          </NavLink>
        </p>
      </div>
    </div>
  )
}

//rows of existing room data
const ExistingRooms = (props) => {
  let rooms = props.rooms;
  let emitJoinRoom = props.emitJoinRoom;

  return Object.keys(rooms).map((elem, index) => {
    let iteratingRoom = rooms[elem];
    let totalPlayers = (iteratingRoom.players.length + " player") + ((iteratingRoom.players.length > 1) ? "s" : "");
    return (
      <div
        className="selectorRow noselect"
        key={"room" + index}
        onClick={()=>{
          emitJoinRoom(iteratingRoom.roomName);
        }}
      >
        <div className="selectorCell roomSelectorCell">
          <Home /><p>{iteratingRoom.roomName}</p>
        </div>
        <div className="selectorCell">
          <p className="padding-right">
            {
              new Intl.DateTimeFormat({
                year: "numeric",
                month: "long",
                day: "2-digit"
              }).format(new Date(iteratingRoom.createdOn))
            }
          </p>
          <Users /><p className="margin-right">{totalPlayers}</p>
        </div>
      </div>
    )
  });
}

//to show when loading rooms
const LoadingRows = () => {
  return (
    <div className="selectorRow fatRow loadingRow">
      <div>
        <RefreshCw className="loadingRowRefresh is-48" />
        <p>Now loading rooms...</p>
        <p>Just wait one second!</p>
      </div>
    </div>
  )
}

//to show when there are no rooms
const NoRoomsRow = () => {
  return (
    <div className="selectorRow fatRow noRow">
      <div>
        <Frown className="is-48" />
        <p>There are no existing rooms.</p>
        <NavLink to="/play/create">Make a new one!</NavLink>
      </div>
    </div>
  )
}

export default RoomSelector;
