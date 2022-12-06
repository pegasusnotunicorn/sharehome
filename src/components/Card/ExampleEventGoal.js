const exampleGoals = [
  {
    type:"goal",
    deckName:"Episode Location Card",
    description:"The aisle next to the bathroom on the plane.",
  },
  {
    type:"goal",
    description:"The line for the bathroom at a music festival.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"6AM in a government building.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A conference for fake magicians.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A comedy show, but the comedian is racist.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A bank during a robbery.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A farm where they try to clone extinct animals.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"Train inside a tunnel and the power is out.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A building on fire.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"The zoo, but all the animals just broke free.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"An airplane making a crash landing.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A roller coaster stuck upside down.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"The North Pole (post global warming).",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"The HQ of a multi-billion dollar company.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"Inside a giant inflatable human body.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A museum at midnight.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:`The "Cloud".`,
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A workshop for wannabe influencers.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"At a police lineup of murder suspects.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A pottery class for people deathly afraid of clay.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"An office of infinite cubicles.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"Inside the box of a board game.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A teleporting bar.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"On top of the world's largest mattress.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"The basement of a convicted serial killer.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"The woods filled with sentient non-verbal trees. ",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A desert filled with sugar not sand.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A lecture given by a pickup artist.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A meet & greet event for invisible people.",
    deckName:"Episode Location Card",
  },
  {
    type:"goal",
    description:"A singing competition for deaf people.",
    deckName:"Episode Location Card",
  }
]

const exampleEvents = [
  {
    type:"Event",
    description:"Announce you are quitting social media.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Apologize to someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Ask someone for career advice.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Ask someone for fashion advice.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Ask someone for help with work.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Celebrate your recent promotion.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Challenge someone to a race.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Complain about the food you got.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Complain about your ex.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Complain about your job.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Confront someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Console someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Cook something for someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Crack a joke about something.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Discuss your future goals with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Discuss your ideal partner with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Discuss a movie with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Draw something for someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Encourage others to go to the gym.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Film a video of everyone else.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Get drunk and incite drama.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer vegetables from your garden.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Hack someone's computer.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Help someone solve something.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Invite everyone to your workplace.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Invite someone to go forage for food.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Make drinks for everyone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer a ride to someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer dating advice to someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer life advice to someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer someone some of your food.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer to pay for something.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Offer to swap clothes with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Plan a potluck dinner.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Play a game with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Play an instrument for someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Recommend a restaurant to someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Remind someone to moisturize.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Scare someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Share the results of your recent exam.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Show off what you just purchased.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Take a photo with everyone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Talk about an event from your past.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Talk about animals with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Talk about love with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Talk about sports with someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Teach someone how to code.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Teach someone how to play the guitar.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Throw a celebratory party.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Throw water on someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"WITNESS or COMMIT a murder.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"PURCHASE or STEAL a hypnotist's watch.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"SOLICIT or UNCOVER a government coup.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"CREATE or BUST an illegal cartel.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"EMBEZZLE or INVEST funds from work.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"SNITCH ON or COVER FOR someone.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"LAUNDER or DONATE money.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"SELL or TAKE some mysterious pills.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"CAST or RECEIVE a magic spell.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Raise the dead SILENTLY or EXPLOSIVELY.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"EAT or DRINK something you're not allowed to.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"DRINK or CONCOCT a love potion.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Participate in an illegal STREET RACE or FIGHT CLUB.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"SUMMON or DESTROY a time vortex.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"SMITE or BLESS someone with something holy.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"BORROW or STEAL from a parallel universe.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Build a DEATH-bot or a LIFE-bot.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"UPLOAD or DOWNLOAD your consciousness.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Hand out pamphlets for a CULT or the POLICE.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Print something MAGICAL or CURSED.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Flip over a GLOWING ROCK or a DEAD BODY.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"INCITE or SUBDUE a political riot.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Mix two CHEMICALS or SOULS together.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Hold up a giant ROD or a BABY.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"IGNORE or HEED any flash-flood warnings.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Take an ICE or LAVA bath.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Dig up something MYSTICAL or GHOSTLY.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Walk through a CLONING MACHINE or a TELEPORTER.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"EAT or VAPORIZE a customer.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"DONATE your organs or STEAL MORE.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Use a machine that swaps PERSONALITIES or SPECIES.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Sign up for fertility ASSISTANCE or DEMONSTRATION.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Attend a LOVE or HATE festival.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Inhale a bunch of different GASES or SOULS.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Create an artificially intelligent PRINTER or a BIRD.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Commit BLASPHEMY or ATROCITY.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"COMMIT or CONFESS to a crime.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"SEND or RECEIVE death threats.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Perform a LAB or SOCIAL experiment.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Perform a RITUAL or a MIRACLE.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"ENCHANT or HEX something.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Spawn a SENTIENT or an UNCONSCIOUS being.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Perform INSIDER TRADING or MULTI-LEVEL MARKETING.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Summon a SUCCUBUS or a DEAD POPE.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Concoct something POISONOUS or ADDICTIVE.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"PLANT or DEFUSE a bomb.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Sue someone for INFIDELITY or SLANDER.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Obtain IMMORTALITY or OMNISCIENCE.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Spread a false RUMOR or RELIGION.",
    deckName:"Producer's Direction Card",
  },
  {
    type:"Event",
    description:"Purchase a cursed PAINTING or BIRTHDAY CAKE.",
    deckName:"Producer's Direction Card",
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
