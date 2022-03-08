import { getRandomPerson } from '../Characters/Characters.js';
import { getRandomEventGoal } from '../Card/ExampleEventGoal.js';

//variables for printing in inches
const DPI = 72;   //(dots per inch)
let documentBleed = 0.125;
let documentWidth = 3.5;
let documentHeight = 2.5;
const mainFont = 25;
const subFont = 15;

//turn on bleed;
documentWidth += documentBleed;
documentHeight += documentBleed;

//multiply by DPI;
documentWidth = documentWidth * DPI;
documentHeight = documentHeight * DPI;
documentBleed = documentBleed * DPI;

//magnifyValues for the card viewer and the card preview
export const previewMagnifyValue = 0.5;

//dimensions of the PDF (used to style both PDF and the PDF Wrapper DIV)
//points = inches x dpi (dots per inch)
//double padding for bleed + real padding
export const pdfDimensions = {
  width: documentWidth,
  height: documentHeight,
  padding: 2 * documentBleed,
  mainFont: mainFont,
  subFont: subFont
}

//function to get an image's width + height after object-fit: cover
export function getCoverFitObject(objectWidth, objectHeight, viewerWidth, viewerHeight){
  let viewerRatio = viewerWidth / viewerHeight;
  let objectRatio = objectWidth / objectHeight;

  //get width and height of the object after fit
  let tempObjectWidth, tempObjectHeight;
  if (objectRatio < viewerRatio) {
    tempObjectWidth = viewerWidth;
    tempObjectHeight = viewerWidth / objectRatio;
  } else {
    tempObjectWidth = viewerHeight * objectRatio;
    tempObjectHeight = viewerHeight;
  }

  return {
    width: tempObjectWidth,
    height: tempObjectHeight,
    x: Math.round((viewerWidth/2) - (tempObjectWidth/2)),
    y: Math.round((viewerHeight/2) - (tempObjectHeight/2)),
  };
}

export function getImageObject(url, name, width, height){
  let imageXY = getCoverFitObject(width, height, documentWidth, documentHeight);

  return {
    url: url,
    name: name,
    x: imageXY.x,
    y: imageXY.y,
    width: imageXY.width,
    height: imageXY.height,
  }
}

//default person card variables
export function getDefaultPersonCard(notThisPerson){
  let randomMember = getRandomPerson(notThisPerson);
  let defaultImage = getImageObject(
    randomMember.image.url,
    randomMember.image.name,
    randomMember.image.width,
    randomMember.image.height
  );

  //credit to artist
  defaultImage.credit = randomMember.image.credit;

  //default x and y positions if they exist
  defaultImage.x = (typeof randomMember.image.x !== "undefined") ? randomMember.image.x : defaultImage.x;
  defaultImage.y = (typeof randomMember.image.y !== "undefined") ? randomMember.image.y : defaultImage.y;

  return {
    ...randomMember,
    image : defaultImage,
  }
}

//default event card variables
export function getDefaultEventGoalCard(type, exampleID){
  let randomEventGoal = getRandomEventGoal(type, exampleID);

  return randomEventGoal;
}
