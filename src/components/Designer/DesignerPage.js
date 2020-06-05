import React, { useEffect } from 'react';
import { NavLink, Redirect, Switch, Route } from 'react-router-dom';

//custom files
import DeckManager from './DeckManager/DeckManager.js';
import DeckEditor from './DeckEditor/DeckEditor.js';
import { useStickyReducer, useStickyState } from './utils/stickyHooks.js';
import { reducerForArrays } from './utils/reducerForArrays.js';

const DesignerPage = (props) => {

  //bool to keep track of if we're designing or not
  const [decks, dispatchDeck] = useStickyReducer(reducerForArrays, [], "decks");
  const [currentDeckIndex, setCurrentDeckIndex] = useStickyState(false, "currentDeckIndex");


  useEffect(()=>{
    document.title = "SHAREHOME - Card Designer";

    // props.setShowFooter(false);  //hide footer for designer page
    // props.setShowFooter(!Number.isInteger(currentDeckIndex));  //hide footer for designer page
  });

  let updateCurrentDeck = (newDeck) => {
    dispatchDeck({
      type:"update",
      index:currentDeckIndex,
      item:newDeck,
    });
  }

  //show deck manager if we don't have a current deck we are editing
  return (
    <>
      <div className="content max-width padding-bottom">
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
                  viewerMagnifyValue={3}
                />
              )
            }
            //there is no current deck we are editing
            else {
              return <Redirect to="/designer" />
            }
          }} />
          <Route render={()=>{
            return (
              <DeckManager
                decks={decks}
                dispatchDeck={dispatchDeck}
                currentDeckIndex={currentDeckIndex}
                setCurrentDeckIndex={setCurrentDeckIndex}
              />
            )
          }} />
        </Switch>
      </div>
    </>
  );
}

export default DesignerPage;
