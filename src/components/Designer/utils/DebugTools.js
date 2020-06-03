import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';

import PDFDocument from '../PDFDocument/PDFDocument.js';
import dynamicStylesCard from '../../../css/Designer/dynamicStylesCard.js';

let debugMode = false;

//buttons to console log various debug variables
export const DebugButtons = (props) => {
  if (!debugMode){
    return "";
  }
  else {
    return (
      <div className="devtools sidebarContent">
        <div>Debug Tools</div>
        <button className="button sideBarButton" onClick={()=>{console.log(props.currentCard)}}>Log current card</button>
        <button className="button sideBarButton" onClick={()=>{console.log(props.currentIndex)}}>Log current index</button>
        <button className="button sideBarButton" onClick={()=>{console.log(props.cards)}}>Log cards</button>
      </div>
    )
  }
}

//debug how PDF looks faster with PDFViewer built into browser, dont have to download file each time
export const DebugPDFViewer = (props) => {
  let cardViewerDynamicStyles = dynamicStylesCard(props.viewerMagnifyValue);

  if (!debugMode){
    return "";
  }
  else {
    let embededPDFStyle = {
      width: cardViewerDynamicStyles.style.width,
      height: cardViewerDynamicStyles.style.height,
      outline: 0,
      border: 0,
      display: "inline-block",
      backgroundColor: "rgb(82, 86, 89)",
    }

    //only display when the mouses is up
    if (!props.startingCoords){
      return (
        <PDFViewer style={embededPDFStyle}>
          <PDFDocument
            cards={props.cards}
            type={props.type}
          />
        </PDFViewer>
      )
    }
    else {
      return <div style={embededPDFStyle}></div>
    }
  }
}
