const exampleGoals = [
  { type: "location", description: "6 a.m. in a government building." },
  { type: "location", description: "A bank during a robbery." },
  { type: "location", description: "A beach full of influencers." },
  { type: "location", description: "A building on fire." },
  { type: "location", description: "A bus that can shrink at will." },
  { type: "location", description: "A castle floating in the sky." },
  { type: "location", description: "A cemetery on a full moon at midnight." },
  {
    type: "location",
    description: "A club where memories only last one minute.",
  },
  { type: "location", description: "A comedy show, but the comedian is evil." },
  { type: "location", description: "A conference for fake magicians." },
  {
    type: "location",
    description: "A court where you argue in interpretive dance.",
  },
  { type: "location", description: "A daycare for future geniuses." },
  { type: "location", description: "A desert filled with sugar not sand." },
  { type: "location", description: "A factory that builds robots." },
  {
    type: "location",
    description: "A fancy restaurant where eating is prohibited.",
  },
  { type: "location", description: "A farm for cloning extinct animals." },
  { type: "location", description: "A gym for ghosts and zombies." },
  { type: "location", description: "A hospital for retired superheroes." },
  { type: "location", description: "A laboratory for experiments gone wrong." },
  { type: "location", description: "A lecture given by a pickup artist." },
  { type: "location", description: "A library where books read you instead." },
  {
    type: "location",
    description: "A meet and greet event for doppelgangers.",
  },
  {
    type: "location",
    description: "A movie theater that can predict the future.",
  },
  { type: "location", description: "A museum of invisible art." },
  { type: "location", description: "A park full of multiplying bunnies." },
  { type: "location", description: "A runaway train and the power is out." },
  { type: "location", description: "A school for aspiring villains." },
  { type: "location", description: "A station for mystical vehicles." },
  { type: "location", description: "A teleporting bar." },
  { type: "location", description: "A theme park of illusions." },
  { type: "location", description: "A travel agency for time travel." },
  { type: "location", description: "A workshop for procrastinators." },
  { type: "location", description: "An airplane making a crash landing." },
  { type: "location", description: "An airport for winged creatures." },
  { type: "location", description: "An ancient battlefield." },
  { type: "location", description: "An eating competition for robots." },
  { type: "location", description: "An office of infinite cubicles." },
  { type: "location", description: "At a police lineup of suspects." },
  { type: "location", description: "Deep in an underwater ocean base." },
  { type: "location", description: "On top of the world's largest mattress." },
  { type: "location", description: "Santa's attic." },
  { type: "location", description: "The 'Cloud'." },
  { type: "location", description: "The basement of a wanted criminal." },
  { type: "location", description: "The bedroom of an influential leader." },
  { type: "location", description: "The inside of a board game box." },
  { type: "location", description: "The inside of a giant human body." },
  { type: "location", description: "The line for the bathroom at a festival." },
  { type: "location", description: "The North Pole post global warming." },
  { type: "location", description: "The woods filled with sentient trees." },
  {
    type: "location",
    description: "The zoo but all the animals just broke free.",
  },
];

const exampleEvents = [
  { type: "event", description: "Announce a new business" },
  { type: "event", description: "Announce a new religion" },
  { type: "event", description: "Announce a pregnancy" },
  { type: "event", description: "Announce an engagement" },
  { type: "event", description: "Celebrate a birthday" },
  { type: "event", description: "Celebrate a graduation" },
  { type: "event", description: "Celebrate a holiday" },
  { type: "event", description: "Celebrate a promotion" },
  { type: "event", description: "Celebrate the birth of a child" },
  { type: "event", description: "Complain about food" },
  { type: "event", description: "Complain about life" },
  { type: "event", description: "Complain about politics" },
  { type: "event", description: "Complain about someone" },
  { type: "event", description: "Complain about your career" },
  { type: "event", description: "Complain about your love life" },
  { type: "event", description: "Cook a meal" },
  { type: "event", description: "Crack a joke" },
  { type: "event", description: "Dance" },
  { type: "event", description: "Film a short video" },
  { type: "event", description: "Get drunk and cry" },
  { type: "event", description: "Get drunk and fight" },
  { type: "event", description: "Give away prized treasure" },
  { type: "event", description: "Give away unwanted junk" },
  { type: "event", description: "Invite everyone to your home" },
  { type: "event", description: "Invite everyone to your workplace" },
  { type: "event", description: "Make drinks" },
  { type: "event", description: "Plan a blind date" },
  { type: "event", description: "Plan a career fair" },
  { type: "event", description: "Plan a magical party" },
  { type: "event", description: "Share a controversial opinion" },
  { type: "event", description: "Share an online article" },
  { type: "event", description: "Share something confusing" },
  { type: "event", description: "Share something dark" },
  { type: "event", description: "Share something inspiring" },
  { type: "event", description: "Share something magical" },
  { type: "event", description: "Share something romantic" },
  { type: "event", description: "Share something tragic" },
  { type: "event", description: "Share the results of an exam" },
  { type: "event", description: "Share your feelings" },
  { type: "event", description: "Show off your body" },
  { type: "event", description: "Show off your riches" },
  { type: "event", description: "Show off your skills" },
  { type: "event", description: "Show off your trophies or awards" },
  { type: "event", description: "Sing" },
  { type: "event", description: "Talk about your childhood" },
  { type: "event", description: "Talk about your dreams" },
  { type: "event", description: "Talk about your ethnicity or species" },
  { type: "event", description: "Talk about your family" },
  { type: "event", description: "Talk about your friends" },
  { type: "event", description: "Talk about your hobbies" },
  { type: "event", description: "Attend a LOVE or HATE festival" },
  { type: "event", description: "Bask in GLORY or FLATULENCE" },
  { type: "event", description: "Borrow from a PARALLEL or DIGITAL universe" },
  { type: "event", description: "Build a MURDEROUS or PEACE-LOVING robot" },
  { type: "event", description: "Buy something USELESS or ADDICTIVE" },
  { type: "event", description: "Cast a MAGIC SPELL or an ILLEGAL VOTE" },
  { type: "event", description: "Cause MUSCULAR or AWKWARD tension" },
  { type: "event", description: "Commit BLASPHEMY or ATROCITY" },
  { type: "event", description: "Concoct a LOVE or SHAPESHIFTING potion" },
  { type: "event", description: "Conjure a time VORTEX or PARADOX" },
  { type: "event", description: "Create something MAGICAL or CURSED" },
  { type: "event", description: "Dig up a FUTURISTIC or GHOSTLY item" },
  { type: "event", description: "DONATE or LAUNDER money" },
  { type: "event", description: "EAT or THROW UP something forbidden" },
  {
    type: "event",
    description: "Enact INSIDER TRADING or MULTI-LEVEL MARKETING",
  },
  { type: "event", description: "ENCHANT or CURSE something" },
  { type: "event", description: "Find an ANGELIC or RADIOACTIVE body" },
  { type: "event", description: "Give up your ORGANS or DIGNITY" },
  { type: "event", description: "Ignore your PAIN or DESIRES" },
  { type: "event", description: "Incite a POLITICAL or VIRTUAL riot" },
  { type: "event", description: "Inhale toxic GASES or VIBES" },
  { type: "event", description: "Journey to PARADISE or CHAOS" },
  { type: "event", description: "Mix two CHEMICALS or SOULS together" },
  { type: "event", description: "Obtain IMMORTALITY or OMNISCIENCE" },
  { type: "event", description: "Participate in a BAKE OFF or FIGHT CLUB" },
  { type: "event", description: "Perform a RITUAL or MIRACLE" },
  { type: "event", description: "PLANT or DEFUSE a giant bomb" },
  { type: "event", description: "Purchase a cursed WEAPON or PRINTER" },
  { type: "event", description: "RAISE or BURY the dead" },
  { type: "event", description: "Recruit for a CULT or QUEST" },
  { type: "event", description: "Sign up for FERTILITY or PIRATE school" },
  { type: "event", description: "SMITE or BLESS someone" },
  { type: "event", description: "SNITCH ON or SACRIFICE FOR someone" },
  { type: "event", description: "Spawn a sentient COMPUTER or ANIMAL" },
  { type: "event", description: "Spread fake NEWS or CURRENCY" },
  { type: "event", description: "Stage a LAB or SOCIAL experiment" },
  {
    type: "event",
    description: "Steal a TIME TRAVELLER'S or HYPNOTIST'S watch",
  },
  { type: "event", description: "Sue someone for PROMISCUITY or DEFAMATION" },
  { type: "event", description: "Summon a DEMON or an ANGEL" },
  { type: "event", description: "Swallow COLORFUL or SMELLY pills" },
  { type: "event", description: "Swap PERSONALITIES or POSSESSIONS" },
  { type: "event", description: "Swindle money from WORK or FAMILY" },
  { type: "event", description: "Take an ICE or LAVA bath" },
  { type: "event", description: "Uncover a GOVERNMENT or ALIEN conspiracy" },
  { type: "event", description: "Upload your CONSCIOUSNESS or BODY" },
  { type: "event", description: "Use a CLONING MACHINE or a TELEPORTER" },
  { type: "event", description: "Vaporize an ENEMY or a FRIEND" },
  {
    type: "event",
    description: "Violate INTERNATIONAL LAW or SOCIAL ETIQUETTE",
  },
  { type: "event", description: "Wield a DULL SWORD or a TOXIC PLANT" },
  { type: "event", description: "Witness divine INTELLIGENCE or INTERVENTION" },
];

//return the details of a random event or a goal, not the same as previous
export function getRandomEventGoal(type, exampleID) {
  let arrayToSearch = type === "event" ? exampleEvents : exampleGoals;
  let randomEventGoal =
    arrayToSearch[Math.floor(Math.random() * arrayToSearch.length)];

  if (typeof exampleID !== "undefined") {
    return randomEventGoal.exampleID === exampleID
      ? getRandomEventGoal(type, exampleID)
      : randomEventGoal;
  } else {
    return randomEventGoal;
  }
}

//returns X amount of random event or goals
export function getRandomEventsGoals(type, totalCount) {
  let arrayToSearch = type === "event" ? exampleEvents : exampleGoals;
  let randomSorted = arrayToSearch.sort(() => (Math.random() > 0.5 ? 1 : -1));
  return randomSorted.slice(0, totalCount);
}
