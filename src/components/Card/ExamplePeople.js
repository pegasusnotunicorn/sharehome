const examplePeople = [
  {
    name: "Wonmin Lee",
    age: new Date(new Date() - new Date(new Date(1991,9,10))).getFullYear() - 1970,
    job: "Game Designer",
    race:"Human",
    description:"The creator of this game!",
		hobbies: "Playing video games.",
    japaneseJob: "ゲームクリエイター",
    japaneseName: "リー・ウォンミン",
    image: {
      url: "/images/members/member_wonmin.jpg",
      name: "member_wonmin.jpg",
      width: 1467,
      height: 978,
      credit: "https://1minlee.com"
    },
    ignoreInRandom: true,
  },
  {
    name: "Urg the Hacker",
    age: 30,
    job: "Web Designer",
    race:"Orc",
    description:"Bullied a lot as a kid for his scrawny stature, he turned to the dark web for comfort and found his belonging there. A bit different from your average orc.",
		hobbies: "Hacking greedy corporate websites like a modern day robin hood and donating stolen money to charities.",
    japaneseJob: "Webデザイナー",
    japaneseName: "ハッカーのウルグ",
    image: {
      url: "/images/members/characters1.jpg",
      name: "characters1.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Beatrice Cavendish",
    age: 27,
    job: "Optometrist",
    race:"Cockatrice",
    description:"Can kill people with just one look according to legend. Born and raised in England.",
		hobbies: "Really into vegan culture but still eats meat on occasion.",
    japaneseJob: "検眼医",
    japaneseName: "ベアトリス・カヴェンディッシュ",
    image: {
      url: "/images/members/characters2.jpg",
      name: "characters2.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Tsukasa Shōbō",
    age: 19,
    job: "Aspiring Firefighter",
    race:"Elf",
    description:"An elf of Japanese descent. Physically has stopped growing as most elves do, but is still very immature in his personality and emotional intelligence. Moved to the big city from his village in the forest. He is aspiring to be a forest firefighter like a lot of his hometown elf friends.",
		hobbies: "Learning the guitar. Skateboarding. Singing. Pretty much anything that might make him more attractive to the opposite gender.",
    japaneseJob: "消防士志望",
    japaneseName: "小坊士",
    image: {
      url: "/images/members/characters3.jpg",
      name: "characters3.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Köttr, the Grumpy",
    age: 121,
    job: "Courier",
    race:"Dragon",
    description:"Dragons reach adulthood around age 100. Very lazy and likes to sleep a lot, like a cat. Chases their tail sometimes out of boredom.",
		hobbies: "Sleeping.",
    japaneseJob: "宅配人",
    japaneseName: "不機嫌のコトル",
    image: {
      url: "/images/members/characters4.jpg",
      name: "characters4.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Lydia Grimsbane",
    age: 19,
    job: "Student",
    race:"Witch",
    description:"Attends the local witchcraft school. Concentrating on potions. Wants to hopefully help creatures with her magic when she graduates.",
		hobbies: "Reading. Particularly science fiction books about a world ruled by only humans.",
    japaneseJob: "学生",
    japaneseName: "リディア・グリムズベイン",
    image: {
      url: "/images/members/characters5.jpg",
      name: "characters5.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Ahxi Raanee",
    age: 28,
    job: "Lab Technician",
    race:"Basilisk",
    description:"Extremely venemous. Wants to help develop new antivenoms and chemical products using her venom.",
		hobbies: "Crossfit. Particularly anything that requires a pole.",
    japaneseJob: "検査技師",
    japaneseName: "アッシ・ラーニー",
    image: {
      url: "/images/members/characters6.jpg",
      name: "characters6.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Ogark Chestmaul",
    age: 17,
    job: "Part-time Bouncer",
    race:"Ogre",
    description:"Lost his left hand in a bet when he was a teenager hanging with the wrong crowd. For each time he almost relapsed back into that crowd, he got a tattoo above his amputated hand. A bit dumb but means very well.",
		hobbies: "Bird watching.",
    japaneseJob: "クラブの用心棒",
    japaneseName: "オガルク・チェストモール",
    image: {
      url: "/images/members/characters7.jpg",
      name: "characters7.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Anna Salandria Westergaard",
    age: 23,
    job: "Model",
    race:"Dark Elf",
    description:"Abandoned by her family as a baby, she was raised by farmers who found her crying in the forest. Thus she grew up with human values and culture but never felt that she belonged. Moved to the city in search of other dark elves.",
		hobbies: "Haggling. Finding good deals when shopping.",
    japaneseJob: "モデル",
    japaneseName: "アンナ・サラドリア・ウェスターガード",
    image: {
      url: "/images/members/characters8.jpg",
      name: "characters8.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Korelin Bottleguard",
    age: 24,
    job: "Mechanic",
    race:"Dwarf",
    description:"Youngest daughter in a long lineage of alcohol-loving Bottleguards. She can easily drink more than creatures three times her size. Beer, wine, spirits, anything. Bottleguards are always the last to leave the pub.",
    hobbies: "Drinking. Duh.",
    japaneseJob: "整備士",
    japaneseName: "コレリン・ボトルガード",
    image: {
      url: "/images/members/characters9.jpg",
      name: "characters11.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Bizz Hagglefeet",
    age: 15,
    job: "Banker",
    race:"Goblin",
    description:"Goblins reach adulthood around age 8. Really good with numbers and really good with people. Doesn't need a calculator for anything and has an excellent memory.",
		hobbies: "Calculus and watching pickup artist videos online.",
    japaneseJob: "銀行家",
    japaneseName: "ビズ・ハグルフィート",
    image: {
      url: "/images/members/characters9.jpg",
      name: "characters9.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Seji Toomin",
    age: 22,
    job: "Lawyer",
    race:"Troll",
    description:"Mountain rock troll of the Toomin tribe. Moved to the city at a young age to study and pass the bar. Wanted to prove to the world that trolls are not as dumb as stereotypes would have you believe.",
		hobbies: "Doing pro-bono cases for under-represented trolls. Particularly mountain trolls like himself.",
    japaneseJob: "弁護士",
    japaneseName: "セジ・トゥーミン",
    image: {
      url: "/images/members/characters10.jpg",
      name: "characters10.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Dorpip Wadlezedle",
    age: 23,
    job: "Comedian",
    race:"Gnome",
    description:"With a surname like Wadlezedle he believes he was born to be a comedian, but his family of engineers and inventors disagree wholeheartedly and look upon him as the black sheep of the family.",
		hobbies: "Making everyone laugh.",
    japaneseJob: "お笑い芸人",
    japaneseName: "ドルピップ・ワドルゼドル",
    image: {
      url: "/images/members/characters12.jpg",
      name: "characters12.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Susom the Giant",
    age: 50,
    job: "Construction Worker",
    race:"Giant",
    description:"Giants reach adulthood around age 50. Very shy despite her stature and size. Always wanted a surname to fit in with the world. Doesn't like standing out. ",
		hobbies: "People watching.",
    japaneseJob: "建設労働者",
    japaneseName: "巨人のスソム",
    image: {
      url: "/images/members/characters13.jpg",
      name: "characters13.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Hansan Snekker",
    age: 31,
    job: "Wizard",
    race:"Wizard",
    description:"Graduated from a top academy of Wizarding, works out of his studio and fixes various problems that only a wizard can solve. Is really into woodworking when not doing magical things.",
		hobbies: "Woodworking.",
    japaneseJob: "魔法使い",
    japaneseName: "ハンサン・スネッカー",
    image: {
      url: "/images/members/characters14.jpg",
      name: "characters14.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Soh",
    age: 24,
    job: "Printer",
    race:"Unicorn",
    description:"Youngest in a large family of 7 children. Spoiled as a child but grew up very spirited and entrepreneurial.",
		hobbies: "Collecting wood type (used for the printing press)",
    japaneseJob: "印刷人",
    japaneseName: "ソゥ",
    image: {
      url: "/images/members/characters15.jpg",
      name: "characters15.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Rosamund Galbassi",
    age: 27,
    job: "Foot Model",
    race:"Monopod",
    description:"Very fast despite only having one leg. Very stable because of the large size of the foot makes her center of gravity much lower. ",
		hobbies: "Cosplay. Especially really creative ones involving one leg.",
    japaneseJob: "美脚モデル",
    japaneseName: "ロザムンド・ガルバッシー",
    image: {
      url: "/images/members/characters16.jpg",
      name: "characters16.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Grodrot, The Hungry",
    age: 65,
    job: "Chef",
    race:"Wyvern",
    description:"Wyverns reach adulthood around age 60. Always hungry. Always snacking on something. Attended culinary school in France and specializes in French cooking.",
		hobbies: "Taking photos of food.",
    japaneseJob: "シェフ",
    japaneseName: "空腹のグロドット",
    image: {
      url: "/images/members/characters17.jpg",
      name: "characters17.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Robin Stringsworth",
    age: 19,
    job: "Server (Maid Cafe)",
    race:"Talking Puppet",
    description:"Comes from a family of puppets that were given life to by a famous woodworking wizard. Nobody knows who the wizard is.",
		hobbies: "Enjoys dressing up in lolita fashion.",
    japaneseJob: "メードカフェの店員",
    japaneseName: "ロビン・ストリングズワース",
    image: {
      url: "/images/members/characters18.jpg",
      name: "characters18.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Gingernuts Goodyhug",
    age: 19,
    job: "Convenience Store Part-timer",
    race:"Gingerbread Being",
    description:"Needs to constantly change his body parts to avoid rotting. Really likes getting a sugar high. Basically a stoner. Sometimes enjoys eating parts of his own body.",
		hobbies: "Stealing sugary food from work.",
    japaneseJob: "コンビニフリーター",
    japaneseName: "ジンジャーナッツ・グディハグ",
    image: {
      url: "/images/members/characters19.jpg",
      name: "characters19.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Celestia Bernard",
    age: 26,
    job: "Artist",
    race:"Bicorn",
    description:"Grew up in France. Really into drawing and painting. Quit her corporate job a few years back to pursue freelance illustrating.",
		hobbies: "Karaoke.",
    japaneseJob: "美術家",
    japaneseName: "セレチア・バーナード",
    image: {
      url: "/images/members/characters20.jpg",
      name: "characters20.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Elias & Maya Dimakos",
    age: 25,
    job: "Accountant / Freelance Artist",
    race:"Gemini",
    description:"Gemini have two brains but share one body. Usually the two individual personalities are quite similar but there have been rare cases of them being vastly different. Elias is more creative and enjoys making things while Maya is more calculating and enjoys planning things out.",
		hobbies: "Elias - making art / videos. Maya - solving riddles / puzzles.",
    japaneseJob: "会計士 / フリーランスアーティスト",
    japaneseName: "エリアス＆マヤ・ディマコス",
    image: {
      url: "/images/members/characters21.jpg",
      name: "characters21.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: 'Domination "Dommy" Armor Set',
    age: "???",
    job: "Security Guard",
    race:"Knight Armor",
    description:"Enchanted by a witch and came to life. Countless knights and demons wore this armor set into battle but none are alive today. Nobody knows who created the armor set or when it was made.",
		hobbies: "Jump scaring innocent people.",
    japaneseJob: "銀行の警備員",
    japaneseName: "覇業の鎧、ハギちゃん",
    image: {
      url: "/images/members/characters22.jpg",
      name: "characters22.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: 'Arya Jensen',
    age: 29,
    job: "Minister",
    race:"Sea Monk",
    description:"Grew up in a small town in Denmark. Worshipped higher beings since childhood. Born into the Church life and wants to spread the good word to the rest of the world.",
		hobbies: "Fishing. Catch and release only.",
    japaneseJob: "司祭",
    japaneseName: "アルヤ・ジェンセン",
    image: {
      url: "/images/members/characters23.jpg",
      name: "characters23.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Nycolas O'Sullivan",
    age: 21,
    job: "Jockey (Horse Racer)",
    race:"Dullahan",
    description:"Rode horses for as long as he could remember. Probably rode horses in his previous life as a human before becoming a Dullahan. Lives on a farm raising purebred horses for racing. Loves competition.",
		hobbies: "Taking care of animals.",
    japaneseJob: "騎手",
    japaneseName: "ニコラス・オサリバン",
    image: {
      url: "/images/members/characters24.jpg",
      name: "characters24.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Brigit Ní Colla",
    age: 22,
    job: "Model / Bank Teller",
    race:"Leprechan",
    description:"Female leprechauns basically don't exist and are extremely rare. Therefore she is extremely popular and is often surrounded by male peers trying to woo her.",
		hobbies: "Photography. Both taking photos and getting photos taken of.",
    japaneseJob: "モデル / 窓口係",
    japaneseName: "ブリジェット・ニコラ",
    image: {
      url: "/images/members/characters25.jpg",
      name: "characters25.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
]

// shuffle an array
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

//return the details of a random person
export function getRandomPerson(notThisPerson){
  var rando = examplePeople[Math.floor(Math.random() * examplePeople.length)];
  if ((notThisPerson && rando.name === notThisPerson) || rando.ignoreInRandom){
    return getRandomPerson(notThisPerson);
  }
  return rando;
}

//return details of a specific person or a random one if cant find
export function getSpecificPerson(personName){

  //search for them
  for (let i = 0; i < examplePeople.length ; i++){
    if (examplePeople[i].name === personName){
      return examplePeople[i];
    }
  }

  //couldnt find, so return a random
  return getRandomPerson();
}

//returns details of all characters except the ones who need to be ignored
export function getAllPeople(random){
  let removedIgnoredChars = examplePeople.filter((e)=>{
    return !e.ignoreInRandom;
  })
  if (random) {
    return shuffle(removedIgnoredChars)
  }
  else {
    return removedIgnoredChars;
  }
}

//returns the latest person
export function getLatestPerson(){
  let removedIgnoredChars = getAllPeople();
  return removedIgnoredChars[removedIgnoredChars.length - 1];
}
