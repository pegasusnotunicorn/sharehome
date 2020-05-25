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
export const PDFDimensions = {
  width: documentWidth,
  height: documentHeight,
  padding: 2 * documentBleed,
  mainFont: mainFont,
  subFont: subFont
}

//function to get an image's width + height after object-fit: cover
function getCoverFitObject(objectWidth, objectHeight, viewerWidth, viewerHeight){
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

//default card variables
const defaultName = "Candace Green";
const defaultJapaneseName = "キャンディス•グリーン";
const defaultAge = "21";
const defaultJob = "Influencer";
const defaultImage = getImageObject(
  "/images/test.jpg",     //url
  "test.jpg",             //name
  1000,                   //width
  1400                    //height
);

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

export function getDefaultCardObject(){
  return {
    name : defaultName,
    japaneseName : defaultJapaneseName,
    age : defaultAge,
    job : defaultJob,
    image : defaultImage,
  }
}
