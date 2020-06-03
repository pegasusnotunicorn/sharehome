const exampleGoals = [
  {
    exampleID:1,
    description:"This is a random goal."
  },
  {
    exampleID:2,
    description:"This is a second random goal."
  },
]

const exampleEvents = [
  {
    exampleID:1,
    description:"This is a random event."
  },
  {
    exampleID:2,
    description:"This is a second random event."
  },
]

//return the details of a random event or a goal, not the same as previous
export function getRandomEventGoal(type, exampleID){
  let arrayToSearch = (type === "event") ? exampleEvents : exampleGoals;
  let randomEventGoal = arrayToSearch[Math.floor(Math.random() * arrayToSearch.length)];

  if (typeof exampleID !== "undefined"){
    return (randomEventGoal.exampleID === exampleID) ? getRandomEventGoal(type, exampleID) : randomEventGoal;
  }
  else {
    return randomEventGoal;
  }
}
