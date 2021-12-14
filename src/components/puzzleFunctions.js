//<editor-fold>------------------------------------------GLOBAL---------------------------------------------------

//random between two numbers
export function randomIntFromInterval(min, max) { // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//X amount of random numbers between two numbers
export function xRandomIntFromInterval(total, min, max){
  let arr = [];
  while (arr.length < total){
    let r = randomIntFromInterval(min, max);
    if (arr.indexOf(r) === -1) arr.push(r);
  }
  return arr;
}

//coordinates for cards on the 2x5 grid
export const gridCoords = [
  [{top:"13.5%",left:"0.5%"}, {top:"13.5%",left:"20.5%"}, {top:"13.5%",left:"40.5%"}, {top:"13.5%",left:"60.5%"}, {top:"13.5%",left:"80.5%"}], //first column
  [{top:"57%",left:"0.5%"}, {top:"57%",left:"20.5%"}, {top:"57%",left:"40.5%"}, {top:"57%",left:"60.5%"}, {top:"57%",left:"80.5%"}], //second column
]

//various variables for text
export const constVars = {
   companyInfluence : `<span class='is-bold is-monospace'>Company Influence</span></span> ( <img class="playerBoardIcon influenceIcon" src="../assets/images/puzzle/influenceIcon.png" /> )`,
   projectCard : `<span class='is-bold is-monospace'>Project Card</span> ( <img class="playerBoardIcon projectIcon" src="../assets/images/puzzle/projectIcon.png" /> )`,
   projectCards : `<span class='is-bold is-monospace'>Project Cards</span> ( <img class="playerBoardIcon projectIcon" src="../assets/images/puzzle/projectIcon.png" /> )`,
   opCard : `<span class='is-bold is-monospace'>Office Politics card</span></span><span class="not-monospace"> ( </span><img class="playerBoardIcon opIcon" src="../assets/images/puzzle/opIcon.png" /><span class="not-monospace"> )</span>`,
   opCards : `<span class='is-bold is-monospace'>Office Politics cards</span></span><span class="not-monospace"> ( </span><img class="playerBoardIcon opIcon" src="../assets/images/puzzle/opIcon.png" /><span class="not-monospace"> )</span>`,
   brDesktop : `<br class="is-hidden-mobile is-hidden-tablet">`
}

//check for mobile
window.mobileCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);

  return (getWidthInEm() < 75) ? true : check;
};

//small window for desktop
function getWidthInEm(){
  return window.innerWidth / parseFloat(
    getComputedStyle(
      document.querySelector('body')
    )['font-size']
  )
}

//</editor-fold>

//<editor-fold>------------------------------------------PUZZLE BOARD---------------------------------------------

//start!
export function start(steps, resetFunc, bypassReset, topText){

  //set random player color, changes per page refresh
  let randomColorArr = xRandomIntFromInterval(2, 0, 3);
  document.getElementById("playerMeeple").src = `../assets/images/puzzle/meeple${randomColorArr[0]}.png`;
  document.getElementById("enemyMeeple").src = `../assets/images/puzzle/meeple${randomColorArr[1]}.png`;

  //resizing for mobile
  window.addEventListener('resize', ()=>{
    setupMobile(topText);
  });

  //click more details OP card to close all OP card detail views
  document.getElementById("detailsWrapper").addEventListener("click", (e) => {
    if(e.target === e.currentTarget) removeAllOpCardFixed();
  });

  //click the detail image to close the detailed view
  document.getElementById("nameDetail").addEventListener("click", ()=>{
    removeAllOpCardFixed();
  });

  //show start button in beginning
  let startButton = document.getElementById("startButton");
  startButton.classList.remove("is-hidden");

  //click button to start
  startButton.addEventListener("click", () => {

    //hide start button and text
    startButton.classList.add("is-hidden");
    startButton.setAttribute("start", true);

    //check for mobile sizing
    setupMobile(topText);

    //start steps
    showPuzzleText(steps, 0, resetFunc, bypassReset);
  });
}

//reset the puzzle, add active to gameboard
function resetPuzzle(specificReset){
  let gameObjs = document.getElementsByClassName("gameObj");
  for (let i = 0; i < gameObjs.length; i++) {
    gameObjs[i].classList.remove("deemphasized", "is-active");
  }
  document.getElementById("gameboard").classList.add("is-active");

  //if there are any specific resets to do
  if (specificReset){
    specificReset();
  }
}

//setup mobile layout
export function setupMobile(topText){
  let gameBoardTextWrapper = document.getElementById("gameBoardTextWrapper");
  let gameBoardTextLocation = document.getElementById("gameBoardTextLocation");
  let topTextWrapper = document.getElementById("topTextWrapper");

  let mobileCheck = window.mobileCheck();
  topTextWrapper.setAttribute("viewType", (mobileCheck) ? "mobile" : "desktop");

  //mobile and has started
  if (window.mobileCheck() && document.getElementById("startButton").getAttribute("start") === 'true'){
    topTextWrapper.innerHTML = "";
    topTextWrapper.appendChild(gameBoardTextWrapper);
  }
  //desktop
  else {
    topTextWrapper.innerHTML = topText;
    gameBoardTextLocation.appendChild(gameBoardTextWrapper);
  }

  //unhide "hide" button on desktop
  if (!mobileCheck){
    if (document.getElementById("puzzleWrapper").getAttribute("puzzle") === "started"){
      showHideButton(true);
    }
  }
  else {
    showHideButton(false);
  }
}

//show text on the puzzle
export function showPuzzleText(steps, nextStep, specificReset, bypassReset){

  //reset puzzle first if starting over, ignore first time running
  if (nextStep === 0 && !bypassReset){
    resetPuzzle(specificReset);
  }

  //going to next step, remove any fixed OP cards
  removeAllOpCardFixed();

  //position the gameboard text
  let gameBoardTextWrapper = document.getElementById("gameBoardTextWrapper");
  gameBoardTextWrapper.classList.remove("is-hidden");
  gameBoardTextWrapper.style.top = steps[nextStep].top;
  gameBoardTextWrapper.style.left = steps[nextStep].left;
  gameBoardTextWrapper.classList.add("is-active");

  //fill in the gameboard text
  let gameBoardText = document.getElementById("gameBoardText");
  gameBoardText.innerHTML = steps[nextStep].text;

  //prev / reset / next buttons
  let prevButton = document.getElementById("gameBoardTextPrevButton");
  let resetButton = document.getElementById("gameBoardTextResetButton");
  let nextButton = document.getElementById("gameBoardTextNextButton");

  //hide all buttons
  prevButton.classList.add('is-hidden');
  resetButton.classList.add('is-hidden');
  nextButton.classList.add('is-hidden');

  //bind keyboard listener
  let bindKeyboard = (function(steps, nextStep, specificReset) {
    var listeners = {
      keyboardListener: function handler(e){
        //left
        if (e.code === "ArrowLeft" && nextStep - 1 >= 0){
          showPuzzleText(steps, nextStep - 1, specificReset, true);
          this.removeEventListener('keyup', handler);
        }
        //right / space / enter
        else if ((nextStep + 1 < steps.length) && (e.code === "ArrowRight" || e.code === "Space" || e.code === "Enter")){
          showPuzzleText(steps, nextStep + 1, specificReset);
          this.removeEventListener('keyup', handler);
        }
      }
    };
    document.addEventListener('keyup', listeners.keyboardListener, false);

    return {
      cancel: function() {
        document.removeEventListener('keyup', listeners["keyboardListener"], false);
      }
    };
  }(steps, nextStep, specificReset));

  //has the puzzle started?
  let puzzleStarted = document.getElementById("puzzleWrapper").getAttribute("puzzle") === "started";

  //prev button shows except at start
  if (nextStep != 0){
    prevButton = cloneButton(prevButton, steps, nextStep - 1, specificReset, true);
  }

  //reset shows at end
  if (steps.length <= nextStep + 1 && !puzzleStarted){
    resetButton = cloneButton(resetButton, steps, 0, specificReset, false, bindKeyboard);
  }
  //next button shows except at end
  else {
    nextButton = cloneButton(nextButton, steps, nextStep + 1, specificReset);
  }

  //if theres a export function to run, run it
  if (typeof steps[nextStep].func != "undefined"){
    steps[nextStep].func(bindKeyboard, cloneButton, steps, nextStep, specificReset);
  }
}

//clone a board text button and replace it, attach click listener
function cloneButton(buttonToClone, steps, nextStepNum, specificReset, bypassReset, bindKeyboard, cb){
  buttonToClone.classList.remove('is-hidden');
  let buttonClone = buttonToClone.cloneNode(true);

  buttonClone.addEventListener('click', () => {
    showPuzzleText(steps, nextStepNum, specificReset, bypassReset);

    //reset keyboard event handlers because resetting
    if (bindKeyboard){
      bindKeyboard.cancel("keyboardListener");
    }

    //any callbacks
    if (cb){
      cb();
    }
  }, false);
  buttonToClone.parentNode.replaceChild(buttonClone, buttonToClone);

  return buttonClone;
}

//hide the floating text, unbind keyboard, show text to show floating text again
export function hidePuzzleText(){
  let gameBoardTextWrapper = document.getElementById("gameBoardTextWrapper");
  gameBoardTextWrapper.classList.add("is-hidden");

  let startText = document.getElementById("startText");
  if (startText){
    startText.classList.remove("is-hidden");
    startText.innerHTML = `<a id="showPrompt">Click here</a> to show the menu prompt again.`;
  }

  //show the puzzle text on click
  let showPrompt = document.getElementById("showPrompt");
  if (showPrompt) showPrompt.addEventListener("click", unhidePuzzleText);
}

//show the puzzle text
export function unhidePuzzleText(){
  gameBoardTextWrapper.classList.remove("is-hidden");
  let startText = document.getElementById("startText");
  if (startText){
    startText.classList.add("is-hidden");
  }

  //unhide "hide" button on desktop
  if (document.getElementById("topTextWrapper").getAttribute("viewType") === "desktop"){
    if (document.getElementById("puzzleWrapper").getAttribute("puzzle") === "started"){
      showHideButton(true);
    }
  }
  else {
    showHideButton(false);
  }
}

//show or hide hideButton
export function showHideButton(show){
  let hideButton = document.getElementById("gameBoardTextHideButton");
  if (show){
    hideButton.classList.remove('is-hidden');
  }
  else {
    hideButton.classList.add('is-hidden');
  }
}

//</editor-fold>

//<editor-fold>------------------------------------------GAME OBJ-------------------------------------------------

//show a specific element and opaque the other objects
export function emphasizeElement(elementIdOrClass, idOrClass, deemphasizeOthers){

  //deemphasize other game objects so we can highlight the object appearing
  if (deemphasizeOthers){
    let fadeables = document.getElementsByClassName("fadeable");
    for (let i = 0; i < fadeables.length; i++) {
      fadeables[i].classList.add("deemphasized");
    }
  }

  //show either an ID or class
  if (idOrClass === "id"){
    //show the game obj and remove deemphasis
    let elementToShow = document.getElementById(elementIdOrClass);
    elementToShow.classList.add('is-active');
    elementToShow.classList.remove('deemphasized');
  }
  else if (idOrClass === "class"){
    let elementsToShow = document.getElementsByClassName(elementIdOrClass);
    for (let i = 0; i < elementsToShow.length; i++) {
      elementsToShow[i].classList.add("is-active");
      elementsToShow[i].classList.remove("deemphasized");
    }
  }
}

//fade in all
export function emphasizeAll(){
  let fadeables = document.getElementsByClassName("fadeable");
  for (let i = 0; i < fadeables.length; i++) {
    fadeables[i].classList.remove("deemphasized");
  }
}

//fade out all
export function deemphasizeAll(){
  let fadeables = document.getElementsByClassName("fadeable");
  for (let i = 0; i < fadeables.length; i++) {
    fadeables[i].classList.add("deemphasized");
  }
}

//hide a specific element (never to show again)
export function hideElement(elementIdOrClass, idOrClass){
  if (idOrClass === "id"){
    let elementToShow = document.getElementById(elementIdOrClass);
    elementToShow.classList.remove('is-active', 'deemphasized');
  }
  else if (idOrClass === "class"){
    let elementsToShow = document.getElementsByClassName(elementIdOrClass);
    for (let i = 0; i < elementsToShow.length; i++) {
      elementsToShow[i].classList.remove('is-active', 'deemphasized');
    }
  }
}

//reset a game object
export function resetGameObj(gameObjId, reset, style){
  let gameObj = document.getElementById(gameObjId);

  if (reset){
    gameObj.style = null;
  }
  else if (typeof styles != "undefined"){
    gameObj.style = {...styles};
  }
}

//move a gameObj on the board, add any extra styles
export function moveGameObj(gameObjId, styles){
  let gameObj = document.getElementById(gameObjId);

  //merge styles if any
  if (typeof styles != "undefined"){
    Object.assign(gameObj.style, styles);
  }
}

//</editor-fold>

//<editor-fold>------------------------------------------CARDS----------------------------------------------------

//create a project card and return it
export function createProjectCard(idIndex, imageNum, left, y, rotationDeg, cardType, xCoord, yCoord){

  let projectCardImg = document.createElement("img");
  projectCardImg.src = `../assets/images/puzzle/projectCards/Project Cards${imageNum}.jpg`;

  let projectCardWrapper = document.createElement("div");
  projectCardWrapper.id = `projectCard${idIndex}`;
  projectCardWrapper.classList.add("squareCard", "fadeable", "gameObj", "fade", "projectCard");
  projectCardWrapper.style.left = left;
  projectCardWrapper.appendChild(projectCardImg);
  projectCardWrapper.style.top = y;

  //rotation
  if (rotationDeg){
    projectCardWrapper.style.transform = `rotate(${rotationDeg}deg)`;
  }
  projectCardWrapper.setAttribute("rotation", (rotationDeg || 0));
  projectCardWrapper.setAttribute("originalRotation", (rotationDeg || 0));

  //type of card
  if (cardType){
    projectCardWrapper.setAttribute("cardType", cardType);
    switch (cardType) {
      case "one":
        projectCardWrapper.setAttribute("influence", 1);
        break;
      case "two":
        projectCardWrapper.setAttribute("influence", 2);
        break;
      case "three":
        projectCardWrapper.setAttribute("influence", 3);
        break;
      case "boss":
        projectCardWrapper.setAttribute("influence", 0);
        break;
    }
  }

  //set coordinates
  if (typeof xCoord != "undefined"){
    projectCardWrapper.setAttribute("xCoord", xCoord);
  }
  if (typeof yCoord != "undefined"){
    projectCardWrapper.setAttribute("yCoord", yCoord);
  }

  return projectCardWrapper;
}

//get the color of the OP image ID
function getOPColor(imageNum){
  const greenOP = [1,2,4,5,9,13,15,16,18];
  const blueOP = [17,20,21,22,24,25];
  const yellowOP = [3,6,7,11,19,23];
  const redOP = [8,10,12,14];
  let color = greenOP.includes(imageNum) ? "green" :
              blueOP.includes(imageNum) ? "blue" :
              yellowOP.includes(imageNum) ? "yellow" :
              redOP.includes(imageNum) ? "red" : "white";
  return color;
}

//create a blank OP card and add to hand
export function createOPCard(imageNum, index){
  let opCard = document.createElement("img");
  opCard.src = `../assets/images/puzzle/opCards/Office Politics${imageNum}.jpg`;
  opCard.id = `opCard${index}`;
  opCard.classList.add("opCard", "fadeable", "fade", "is-active", "deemphasized");
  opCard.style.left = `${index * 150}px`;
  opCard.style.zIndex = 3 - index;
  return opCard;
}

//set a OP card to a specific card and attach handlers
export function setOPCard(idIndex, cardIndex, forceRefresh){
  let opCard = document.getElementById(`opCard${idIndex}`);
  opCard.src = `../assets/images/puzzle/opCards/Office Politics${cardIndex}.jpg`;
  opCard.setAttribute("color", getOPColor(cardIndex));
  opCard.setAttribute("cardIndex", cardIndex);
  opCard.setAttribute("detailable", "true");
  opCard.setAttribute("listener", "false");
  opCard.classList.remove("disabled");
  opCard.style.top = "";

  //clone node and replace so we remove event listener
  if (cardIndex === 0 || forceRefresh) {
    let opCardClone = opCard.cloneNode(true);
    opCard.parentNode.replaceChild(opCardClone, opCard);
    opCard = opCardClone;
  }

  //if a card face is actually showing
  if (cardIndex != 0){
    opCard.addEventListener("click", (e) => {
      showDetailedOpCard(e, cardIndex, opCard);
    });
  }

}

//reset all OP cards to blanks
export function resetOPCards(){
  let opCards = document.getElementsByClassName("opCard");

  for (let i = 0; i < opCards.length; i++){
    opCards[i].src = `../assets/images/puzzle/opCards/Office Politics0.jpg`;
    opCards[i].style.top = null;
  }
}

//unhighlight all the OP cards
export function unhighlightAllOPCards(keepDeemphasis){
  let opCards = document.getElementsByClassName("opCard");

  for (let i = 0; i < opCards.length; i++){
    if (typeof cardIdIndex != "number"){
      if (!keepDeemphasis){
        opCards[i].classList.remove("deemphasized")
        opCards[i].setAttribute("detailable", "true");
        opCards[i].classList.remove("disabled");
      }

      //if card is not "hidden"
      if (opCards[i].style.top != "150%"){
        opCards[i].style.top = null;
      }
    }
    else {
      opCards[i].classList.add("deemphasized");
    }
  }
}

//highlight a specific card in hand
export function highlightOpCard(cardIdIndex, onlyHighlightThis){

  //dehighlight all
  if (!onlyHighlightThis){
    unhighlightAllOPCards();
  }

  //if highlighting
  if (typeof cardIdIndex === "number"){
    let highlightedCard = document.getElementById(`opCard${cardIdIndex}`)
    highlightedCard.classList.remove("deemphasized");
    moveGameObj(`opCard${cardIdIndex}`, {top:"0.5em"});
  }
}

//hide a specific card in hand
export function hideOrShowOpCard(cardIndex, hide){
  let hideCard = document.getElementById(`opCard${cardIndex}`);

  if (hide){
    hideCard.style.top = "150%";
  }
  else {
    hideCard.style.top = null;
  }
}

//</editor-fold>

//<editor-fold>------------------------------------------DETAILED CARD VIEW---------------------------------------

//all card specific details
const opCardDetails = [
  {
    id: 0,
    name: "back",
    detailsToShow: [],
    addons: 0,
  },
  {
    id: 1,
    name: "belittle the competition",
    detailsToShow: ["type", "name", "effect", "cost", "addon"],
    addons: 1,
  },
  {
    id: 2,
    name: "call in a favor",
    detailsToShow: ["type", "name", "effect", "cost", "addon"],
    addons: 1,
  },
  {
    id: 3,
    name: "develop relationships",
    detailsToShow: ["type", "name", "effect2", "cost"],
    addons: 1,
  },
  {
    id: 4,
    name: "establish a clique",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 5,
    name: "extend a deadline",
    detailsToShow: ["type", "name", "effect", "cost", "addon"],
    addons: 1,
  },
  {
    id: 6,
    name: "fan the flames",
    detailsToShow: ["type", "name", "effect", "cost", "addon"],
    addons: 1,
  },
  {
    id: 7,
    name: "go through old notes",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 8,
    name: "insert your own opinion",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 9,
    name: "move up a deadline",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 1,
  },
  {
    id: 10,
    name: "pass the blame",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 11,
    name: "pick favorites",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 12,
    name: "raise criticisms",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 13,
    name: "reorganize the checklist",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 14,
    name: "report to hr",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 15,
    name: "reschedule the meeting",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 16,
    name: "restructure priorities",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 17,
    name: "slack off",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 18,
    name: "spread a rumor",
    detailsToShow: ["type", "name", "effect", "cost", "addon"],
    addons: 1,
  },
  {
    id: 19,
    name: "stand in for someone",
    detailsToShow: ["type", "name", "effect"],
    addons: 0,
  },
  {
    id: 20,
    name: "steal the credit",
    detailsToShow: ["type", "name", "effect", "cost"],
    addons: 0,
  },
  {
    id: 21,
    name: "suck up to seniors",
    detailsToShow: ["type", "name", "effect", "cost", "addon"],
    addons: 1,
  },
  {
    id: 22,
    name: "throw under the bus",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 23,
    name: "trade meeting notes",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 24,
    name: "volunteer coworkers",
    detailsToShow: ["type", "name", "effect", "cost", "addon2"],
    addons: 2,
  },
  {
    id: 25,
    name: "work overtime",
    detailsToShow: ["type", "name", "effect", "cost"],
    addons: 40,
  },
]

//remove a single OP cards if fixed / detail viewed
export function removeOpCardFixed(opCard){
  opCard.classList.remove("fade");
  opCard.classList.toggle("is-fixed");

  //show the more details layer
  let opCardDetails = document.getElementById("opCardDetails");
  opCardDetails.classList.toggle("is-hidden");

  //so we avoid "fade" animations when clicking off
  setTimeout(()=>{
    opCard.classList.add("fade");
  }, 1);
}

//if any OP cards are fixed / detail viewed, remove it
export function removeAllOpCardFixed(){
  let fixedOpCards = document.getElementsByClassName("opCard is-fixed");
  for (let i = 0; i < fixedOpCards.length; i++){
    removeOpCardFixed(fixedOpCards[i]);
  }

  //hide any detailed arrows
  let details = document.getElementsByClassName("detail");
  for (let j = 0; j < details.length; j++){
    details[j].classList.add("is-hidden");
  }
}

//unhide arrows depending on card type
function createDetailedView(cardId){
  let opCardDetail = opCardDetails[cardId];
  let detailsToShow = opCardDetail.detailsToShow;

  for (let i = 0; i < detailsToShow.length; i++){
    document.getElementById(`${detailsToShow[i]}Detail`).classList.toggle("is-hidden");
  }
}

//more details by clicking on OP card
function showDetailedOpCard(e, cardIndex, opCard){

  //only if the card is allowed to be shown in detail (for puzzle)
  if (opCard.getAttribute("detailable") === "true"){

    //hide current card if clicking a new card
    let fixedOpCard = document.querySelector(".opCard.is-fixed");
    if (fixedOpCard && e.target.id != fixedOpCard.id){
      removeAllOpCardFixed();
    }

    //click for more details on OP card
    let detailsButton = document.getElementById("detailsButton");

    //clone details button to remove event listener
    let buttonClone = detailsButton.cloneNode(true);
    buttonClone.addEventListener("click", () => {
      createDetailedView(cardIndex);
    });
    detailsButton.parentNode.replaceChild(buttonClone, detailsButton);

    removeOpCardFixed(e.target);
  }
}

//</editor-fold>
