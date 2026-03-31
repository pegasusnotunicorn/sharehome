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
interface CoverFitResult {
  width: number;
  height: number;
  x: number;
  y: number;
}

export function getCoverFitObject(objectWidth: number, objectHeight: number, viewerWidth: number, viewerHeight: number): CoverFitResult {
  const viewerRatio = viewerWidth / viewerHeight;
  const objectRatio = objectWidth / objectHeight;

  //get width and height of the object after fit
  let tempObjectWidth: number, tempObjectHeight: number;
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
