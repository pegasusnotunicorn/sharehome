import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Square, CheckSquare, MinusSquare, Trash2, Copy, Download, MoreVertical } from 'react-feather';
import { saveAs } from 'file-saver';

import Card from '../../Card/Card.js';
import ConfirmModalButton from '../utils/ConfirmModalButton.js';
import { downloadDecks } from '../utils/downloadPDFFile.js';

import '../../../css/Designer/deckSelector.css';

//row representing a single deck
const DeckRow = (props) => {
  let currentDeck = props.currentDeck;
  let currentDeckIndex = props.currentDeckIndex;
  let setCurrentDeckIndex = props.setCurrentDeckIndex;
  let selectDecks = props.selectDecks;

  //select this row!
  function selectRow(e){
    e.stopPropagation();
    selectDecks([currentDeckIndex], !currentDeck.selected);
  }

  return (
    <div onClick={(e)=>{
      setCurrentDeckIndex(currentDeckIndex);
    }} className={"deckSelectorRow noselect " + ((currentDeck.selected) ? "blueBackground" : "")}>
      <div className="deckSelectorCell">
        <div className="deckSelectorButtonWrapper no-border">
          { currentDeck.selected
            ? (
              <CheckSquare
                className="deckSelectorButton"
                onClick={selectRow}
              />
            )
            : (
              <Square
                className="deckSelectorButton"
                onClick={selectRow}
              />
            )
          }
        </div>
        <Card
          className="deckCard"
          type={currentDeck.type}
          showFront={false}
          disableFlip={true}
          disableShadow={true}
          mainStyle={{
            width:"65px",
            height:"45px",
            fontSize:"1.7px",
          }}
        />
        <p className="deckName">{currentDeck.name}</p>
      </div>
      <div className="deckSelectorCell padding-left">
        <p>{currentDeck.cards.length} {(currentDeck.cards.length > 1) ? "cards" : "card"}</p>
        <p>
          {
            new Intl.DateTimeFormat({
              year: "numeric",
              month: "long",
              day: "2-digit"
            }).format(new Date(currentDeck.createdOn))
          }
        </p>
      </div>
    </div>
  )
}

//header for deck rows
const DeckHeader = (props) => {
  const decks = props.decks;

  const selectDecks = props.selectDecks;
  const deleteDecks = props.deleteDecks;
  const duplicateDecks = props.duplicateDecks;
  const addNewDeck = props.addNewDeck;

  //check mark for the select all button
  const selectedDecks = getSelectedDecks(decks);
  let SelectedSquareIcon = Square;
  if (selectedDecks.length === decks.length){
    SelectedSquareIcon = CheckSquare;
  }
  else if (selectedDecks.length > 0){
    SelectedSquareIcon = MinusSquare;
  }

  let pluralDecks = (selectedDecks.length > 1) ? "these decks?" : "this deck?";

  //toggle select all or none
  function selectAllOrNone(){
    let toSelectAll = (selectedDecks.length === 0) && (selectedDecks.length !== decks.length);
    selectDecks([...Array(decks.length).keys()], toSelectAll);
  }

  //more dialog for holding various other buttons
  const MoreButton = () => {
    const [showMoreDialog, setShowMoreDialog] = useState(false);
    const moreButtonRef = useRef();

    //click off more button
    function handleClickOutside(e){
      if (moreButtonRef.current && !moreButtonRef.current.contains(e.target)){
        setShowMoreDialog(false);
      }
    }

    //event handler to click off the modal dialog
    useEffect(()=>{
      document.addEventListener('click', handleClickOutside, false);

      return ()=>{
        document.addEventListener('click', handleClickOutside, false);
      }
    }, [showMoreDialog]);

    //export decks as JSON
    function exportAsJSON(){
      let tempDecks = [];
      for (let i = 0; i < selectedDecks.length; i++){
        let tempDeck = {
          ...decks[selectedDecks[i]]
        }
        delete tempDeck.selected;
        tempDecks.push(tempDeck);
      }

      let blob = new Blob([JSON.stringify(tempDecks)], {type: "application/json"});
      saveAs(blob, "SHAREHOME_Decks_Exported.json");
    }

    //import decks as JSON
    function importJSON(e){
      if (e.target.files[0]){
        let fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0]);
        fileReader.onload = (event) => {
          let newDecks;
          try {
            newDecks = JSON.parse(event.target.result);
          } catch(e) {
            alert(e); // error in the above string (in this case, yes)!
          }

          if (newDecks){
            //deselect all
            selectDecks([...Array(decks.length).keys()], false);

            //add new decks
            for (let i = 0; i < newDecks.length; i++){
              addNewDeck({
                ...newDecks[i],
                selected:true
              });
            }
          }

        }
      }
    }

    return (
      <div
        ref={moreButtonRef}
        className="noselect button transparentBackground deckSelectorButton"
        onClick={(e)=>{
          setShowMoreDialog(!showMoreDialog);
        }}
      >
        <MoreVertical />
        <input
          id="deckImporter"
          name="deckImporter"
          type="file"
          accept="application/json"
          onChange={importJSON}
        />
        { showMoreDialog &&
          <div className="moreDialog">
            <label
              id="deckImporterLabel"
              className="button transparentBackground"
              htmlFor="deckImporter"
              onClick={(e)=>{
                e.stopPropagation();
              }}
            >
              Import Decks
            </label>
            { selectedDecks.length > 0 &&
              <button
                className="button transparentBackground"
                onClick={exportAsJSON}
              >
                Export Deck{(selectedDecks.length > 1) ? "s" : ""}
              </button>
            }
          </div>
        }
      </div>
    )
  }

  return (
    <div className="deckSelectorRow headerRow noselect">
      <div className="deckSelectorCell">
        <div className="deckSelectorButtonWrapper">
          <SelectedSquareIcon
            className="deckSelectorButton"
            onClick={selectAllOrNone}
          />
        </div>
        <div className="deckSelectorButtonWrapper">
          <ConfirmModalButton
            className="noselect button transparentBackground deckSelectorButton"
            onClick={()=>{
              deleteDecks(selectedDecks);
            }}
            icon={<Trash2 />}
            modalText={"Are you sure you want to delete " + pluralDecks}
          />
        </div>
        <div className="deckSelectorButtonWrapper">
          <Download
            className="noselect button transparentBackground deckSelectorButton"
            onClick={(e)=>{
              downloadDecks(selectedDecks, decks);
            }}
          />
        </div>
        <div className="deckSelectorButtonWrapper">
          <ConfirmModalButton
            className="noselect button transparentBackground deckSelectorButton"
            onClick={(e)=>{
              duplicateDecks(selectedDecks);
            }}
            icon={<Copy />}
            modalText={"Are you sure you want to copy " + pluralDecks}
          />
        </div>
        <div className="deckSelectorButtonWrapper">
          <MoreButton />
        </div>
      </div>
      <div>
        <p>
          <NavLink to="/designer/create">
            + Make a new deck
          </NavLink>
        </p>
      </div>
    </div>
  )
}

//logic for handling deck selection
const DeckSelector = (props) => {
  const decks = props.decks;

  //functions to change decks
  const setCurrentDeckIndex = props.deckFunctions.setCurrentDeckIndex;
  const selectDecks = props.deckFunctions.selectDecks;
  const deleteDecks = props.deckFunctions.deleteDecks;
  const duplicateDecks = props.deckFunctions.duplicateDecks;
  const addNewDeck = props.deckFunctions.addNewDeck;

  //all rows of decks
  const listOfDecks = decks.map((elem, index)=>{
    return (
      <DeckRow
        key={"existingDeck" + index}
        currentDeck={elem}
        currentDeckIndex={index}
        setCurrentDeckIndex={setCurrentDeckIndex}
        selectDecks={selectDecks}
      />
    )
  });

  return (
    <>
      <h3>Select an existing deck to edit</h3>
      <div className="deckSelectorWrapper">
        <DeckHeader
          decks={decks}
          selectDecks={selectDecks}
          deleteDecks={deleteDecks}
          duplicateDecks={duplicateDecks}
          addNewDeck={addNewDeck}
        />
        {listOfDecks}
      </div>
    </>
  )
}

export default DeckSelector;

//function to get the indexes of any selected decks
function getSelectedDecks(decks){
  let selectedDeckIndex = [];
  for (let i = 0; i < decks.length; i++){
    if (decks[i].selected){
      selectedDeckIndex.push(i);
    }
  }
  return selectedDeckIndex;
}
