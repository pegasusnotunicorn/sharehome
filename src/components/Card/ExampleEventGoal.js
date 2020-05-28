const exampleGoals = [
  {
    description:"This is a random goal."
  },
]

const exampleEvents = [
  {
    description:"This is a random event."
  },
]

//return the details of a random event or a goal
export function getRandomEventGoal(type){
  let arrayToSearch = (type === "event") ? exampleEvents : exampleGoals;
  return arrayToSearch[Math.floor(Math.random() * arrayToSearch.length)];
}
