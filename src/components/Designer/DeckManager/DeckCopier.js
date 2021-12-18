import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';

import { ExistingRowsHeader, LoadingRow, NoRoomsRow } from '../../utils/TableRows.js';
import { DeckRow } from './DeckSelector.js';
import { getData } from '../../utils/useFetch.js';

import '../../../css/pages/designer/deckCopier.css';

//CTA buttons to create a new deck
const DeckCreator = (props) => {

  const [publicDecks, setPublicDecks] = useState([]);
  const [loadingDecks, setLoadingDecks] = useState(true);

  const decks = props.decks;
  const createNewDeck = props.createNewDeck;
  const setCurrentDeckIndex = props.setCurrentDeckIndex;

  //refresh decks
  async function getDecks(){
    setLoadingDecks(true);
    let tempDecks = await getData("/decks");
    setPublicDecks(tempDecks);
    setLoadingDecks(false);
  }

  //get public decks
  useEffect(() => {
    let ignore = false;

    async function getDecks(){
      let tempDecks = await getData("/decks");
      if (!ignore) {
        setPublicDecks(tempDecks)
        setLoadingDecks(false)
      };
    }

    getDecks();

    return () => { ignore = true; }
  }, []);

  //copy a public deck and move it to our own decks array
  function copyAndCreateNewDeck(publicDeckToCopyIndex){
    let tempDeck = {
      ...publicDecks[publicDeckToCopyIndex].deck,
      currentCardIndex:0,
    }

    //parse image
    for (let x = 0 ; x < tempDeck.cards.length ; x++){
      tempDeck.cards[x].image = JSON.parse(tempDeck.cards[x].image);
    }
    console.log(tempDeck);

    createNewDeck(tempDeck);
    setCurrentDeckIndex(decks.length);
  }

  //loading decks or done loading
  let listOfDecks;
  if (loadingDecks){
    listOfDecks = <LoadingRow loadingMessage={"Now loading decks..."}/>;
  }
  else {
    if (publicDecks && publicDecks.length > 0){
      listOfDecks = publicDecks.map((elem, index)=>{
        return (
          <DeckRow
            key={"existingDeck" + index}
            currentDeck={elem.deck}
            currentDeckIndex={index}
            setCurrentDeckIndex={copyAndCreateNewDeck}
            showSelector={false}
            />
        )
      });
    }
    else {
      listOfDecks = (
        <NoRoomsRow
          noRowsMessage={"There are no available decks to copy."}
          link={"/designer/create"}
        />
      )
    }
  }

  return (
    <div className="subcontentWrapper">
      <h3 className="subsubtitle">
        { props.decks.length > 0 &&
          <NavLink to="/designer"><ArrowLeft className="subtitleBackPageArrow" /></NavLink>
        }
        <span>Select a deck to copy</span>
      </h3>
      <div className="deckSelectorWrapper">
        <ExistingRowsHeader
          onRefresh={getDecks}
          link={"/designer/create"}
          linkText={"+ Create a new empty deck"}
        />
        { listOfDecks }
      </div>
    </div>
  )
}

export default DeckCreator;
