//random degree between -max and max
export const randomDeg = (max) => {
  return `${randomNumFromNeg(max)}deg`;
}

//random number between -max and max
export const randomNumFromNeg = (max) => {
  return randomNum(0, max) * (Math.round(Math.random()) ? 1 : -1);
}

//random positive number between min and max
export const randomNum = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
