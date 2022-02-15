const exampleGoals = [
  {
    exampleID:1,
    type:"goal",
    description:"Get three people to leave the party because of your actions.",
    deckName:"The Group",
  },
  {
    exampleID:2,
    type:"goal",
    description:"Create a great atmosphere for your guests and enjoy some quality reality TV shows together.",
    deckName:"TH NYC Meetup",
  },
  {
    exampleID:3,
    type:"goal",
    description:"Get someone to yell at you.",
    deckName:"Family Pack",
  },
  {
    exampleID:4,
    type:"goal",
    description:"Learn how to play the guitar.",
    deckName:"Instruments",
  },
  {
    exampleID:5,
    type:"goal",
    description:"Finally get together and go out for drinks + karaoke.",
    deckName:"TH NYC Meetup",
  },
]

const exampleEvents = [
  {
    exampleID:1,
    type: "Event",
    description:"A global pandemic has broken out. The meetup group is no longer allowed to host gatherings in public. Discuss how you are going to be handling this issue.",
    deckName:"TH NYC Meetup",
  },
  {
    exampleID:2,
    type: "Event",
    description:"A member of the group has gone AWOL. Discuss how to best kick him from the group.",
    deckName:"The Group",
  },
  {
    exampleID:3,
    type: "Event",
    description:"A member of the group is having a surfing competition! Go visit them compete with three other members.",
    deckName:"Island Life",
  },
  {
    exampleID:4,
    type: "Event",
    description:"Go on a horse-back riding date around the island with the person you like.",
    deckName:"Island Life",
  },
  {
    exampleID:5,
    type: "Event",
    description:"Go to the movies with someone then get catfished by someone else.",
    deckName:"Island Life",
  },
  {
    exampleID:6,
    type: "Event",
    description:"Invite someone to go on an ice-skating date with you.",
    deckName:"Winter Resort Town",
  },
  {
    exampleID:7,
    type: "Event",
    description:"Invite the person you like to go on a date to Costco.",
    deckName:"People in the City",
  },
  {
    exampleID:8,
    type: "Event",
    description:"Invite the person you like to go on a date to Costco.",
    deckName:"People in the City",
  },
  {
    exampleID:9,
    type: "Event",
    description:"There is expensive meat in the fridge. Eat it without permission with two other members.",
    deckName:"People in the City",
  },
  {
    exampleID:10,
    type: "Event",
    description:"Write a message for someone on their dinner using sauce.",
    deckName:"People in the City",
  },
  {
    exampleID:11,
    type: "Event",
    description:"Forcibly kiss someone.",
    deckName:"The Year 2020",
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

//returns X amount of random event or goals
export function getRandomEventsGoals(type, totalCount){
  let arrayToSearch = (type === "event") ? exampleEvents : exampleGoals;
  let randomSorted = arrayToSearch.sort(() => (Math.random() > .5) ? 1 : -1);
  return randomSorted.slice(0, totalCount);
}
