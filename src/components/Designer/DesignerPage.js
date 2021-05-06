import React, { useState, useEffect } from 'react';
import { NavLink, Redirect, Switch, Route } from 'react-router-dom';
import { Smile } from 'react-feather';

//custom files
import DeckManager from './DeckManager/DeckManager.js';
import DeckEditor from './DeckEditor/DeckEditor.js';
import { useStickyReducer, useStickyState } from '../utils/stickyHooks.js';
import { reducerForArrays } from '../utils/reducers.js';
import { postData } from '../utils/useFetch.js';
import { errorCodes } from '../utils/errorCodes.js';
import Modal from '../utils/Modal.js';

const DesignerPage = (props) => {

  //bool to keep track of if we're designing or not
  const [decks, dispatchDeck] = useStickyReducer(reducerForArrays, [], "decks");
  const [currentDeckIndex, setCurrentDeckIndex] = useStickyState(false, "currentDeckIndex");
  const [displayMessage, setDisplayMessage] = useState("");

  useEffect(()=>{
    document.title = "SHAREHOME - Card Designer";
  });

  let updateCurrentDeck = (newDeck) => {
    dispatchDeck({
      type:"update",
      index:currentDeckIndex,
      item:newDeck,
    });
  }

  //upload current deck to the cloud to save
  let uploadCurrentDeck = async () => {
    const response = await postData("/decks/upload", decks[currentDeckIndex]);
    if (response.state === "error"){
      setDisplayMessage(errorCodes[response.error_code || "database_error"]);
    }
    else {
      setDisplayMessage("Successfully uploaded the deck! It is now available for anyone to view and copy. Thank you!");
    }
  }

  //show deck manager if we don't have a current deck we are editing
  return (
    <>
      <div className="content max-width">
        <NavLink to="/"><div className="title noselect"></div></NavLink>
        <Switch>
          <Route exact path="/designer/edit" render={()=>{
            //if currently editing a deck, show editor
            if (Number.isInteger(currentDeckIndex)){
              return (
                <DeckEditor
                  currentDeck={decks[currentDeckIndex]}
                  updateCurrentDeck={updateCurrentDeck}
                  setCurrentDeckIndex={setCurrentDeckIndex}
                  uploadCurrentDeck={uploadCurrentDeck}
                  viewerMagnifyValue={3}
                />
              )
            }
            //there is no current deck we are editing
            else {
              return <Redirect to="/designer" />
            }
          }} />
        <Route exact path={["/designer", "/designer/create"]} render={()=>{
            return (
              <DeckManager
                decks={decks}
                dispatchDeck={dispatchDeck}
                currentDeckIndex={currentDeckIndex}
                setCurrentDeckIndex={setCurrentDeckIndex}
              />
            )
          }} />
        <Redirect to="/designer" />
        </Switch>
      </div>
      { (displayMessage !== "") &&
        <Modal
          showModal={(displayMessage !== "")}
          setShowModal={()=>{setDisplayMessage("")}}
          showCancel={false}
          modalText={displayMessage}
          confirmText="Got it"
          icon={<Smile className="is-48 yellowStroke" />}
        />
      }
    </>
  );
}

export default DesignerPage;
