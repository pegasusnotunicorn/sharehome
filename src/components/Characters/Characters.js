const allCharacters = [
  {
    name: "Wonmin Lee",
    urlName: "wonmin",
    age: new Date(new Date() - new Date(new Date(1991,9,10))).getFullYear() - 1970,
    job: "Game Designer",
    employer: "Pegasus Games",
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
    title: "Urg the Orc Hacker",
    urlName: "urg",
    age: 30,
    job: "Web Designer",
    employer: "Amazin' E-Commerce",
    race:"Orc",
    description: [
      "Bullied a lot as a kid for his scrawny stature. He was not your typical brutish orc. As a child, he turned to the dark web for comfort and found his belonging there amongst the other outcasts of society.",
      "Rejecting the orc status quo, he wants to change the public perception of his people. His desire to show his race in a better light brought him on the show. He hopes that his illegal darkweb activities won't be discovered by the public."
    ],
		hobbies: [
      "Hacking greedy corporate websites like a modern day robin hood and donating stolen money to charities.",
      "Really fluent in working with dark web cryptocurrencies and money laundering.",
      "Manages a NFT marketplace based on funny orc pictures of the orcs that used to bully him as a child."
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    urlName: "beatrice",
    age: 27,
    job: "Optometrist",
    employer: "Cavendish Optometry",
    race:"Cockatrice",
    description: [
      "Can kill people with just one look according to folk legend. Afraid of testing out that theory so wears special designer sunglasses all the time. Also designs special lenses for other Cockatrices to let them look in the mirror without harm.",
      "Born and raised in England. Has no arms but has a very dextrous beak and legs. Has no knowledge of parents but legend says Cockatrices are born when a rooster's egg is incubated by a snake."
    ],
		hobbies: [
      "Really into vegan culture but still eats meat on occasion.",
      "Enjoys trying on various different sunglasses for fun.",
      "Likes to read about characters used in other languages.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    urlName: "tsukasa",
    age: 19,
    job: "Aspiring Firefighter",
    employer: false,
    race:"Elf",
    description:[
      "An elf of Japanese descent. Physically has stopped growing as most elves do, but is still very immature in his personality and emotional intelligence. Moved to the big city from his village in the forest in pursuit of something more exciting",
      "He is aspiring to be a forest firefighter like a lot of his hometown elf friends. Has never had a girlfriend in his life and his friends never let him forget that."
    ],
		hobbies: [
      "Learning how to play the guitar.",
      "Skateboarding.",
      "Singing and dancing. Especially when alone.",
      "Pretty much anything that might make him more attractive to the opposite gender.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    title: "Köttr, the Grumpy Dragon",
    urlName: "kottr",
    age: 121,
    job: "Courier",
    employer: "Dragon Delivery",
    race:"Dragon",
    description:[
      "Dragons reach adulthood around age 100. Dragons can also freely change their sizes at will, ranging from a small housecat to a large 4 story building. Is very lazy and likes to sleep a lot, like a house cat. Changing sizes requires a great deal of energy and strength.",
      `Chases their tail sometimes out of boredom as a form of light exercise when not working and delivering packages. "Works to live" not "lives to work." Doesn't get along with workaholics.`,
    ],
		hobbies: [
      "Sleeping.",
      "Napping.",
      "Snoozing.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    title: "Lydia Grimsbane, the Witch",
    urlName: "lydia",
    age: 19,
    job: "Student",
    employer: "the Mismonia Academy of Witchcraft",
    race:"Human",
    description:[
      "Lydia is a second-year witch at the Mismonia Academy of Witchcraft for young aspiring witches. Hopes to major in Potions and Mixology. Wants to help creatures with her magical concoctions when she graduates.",
      "Has magical rune tattoos sleeves on both arms. Prefers a bucket hat over the traditional witches hat. Doesn't like wearing long sleeve shirts that cover the tattoos.",
    ],
		hobbies:[
      "Reading. Particularly science fiction books about a parallel world ruled by only humans.",
      "Making mocktails with exotic ingredients.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    urlName: "ahxi",
    age: 28,
    job: "Lab Technician",
    employer: "Serpent Science Lab",
    race:"Basilisk",
    description:[
      "Basilisks are known to be extremely venemous and even a mere whiff of their poison can send victims into a deep coma. Therefore, the venom is a highly sought after commodity in the underground markets.",
      "Despite the notoriety of Basilisks in society, Ahxi wants to help develop new antivenoms and chemical products using the potency of their venom. Came onto the show in hopes of improving public perception of Basilisks.",
    ],
		hobbies:[
      "Crossfit.",
      "Pole Dancing.",
      "Working out. Lifting weights.",
      "Strength training.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    urlName: "ogark",
    age: 17,
    job: "Part-time Bouncer",
    employer: "local nightclubs and bars",
    race:"Ogre",
    description:[
      "Lost his left hand in a bet when he was a teenager hanging out with the wrong crowd. He has since cut all ties with that crowd and for each time he almost relapsed back into that crowd, he got a tattoo right above his amputated hand to remind him of the accident.",
      "A bit dumb but means very well. Extremely well loved by anyone who has met him. A big gentle giant.",
    ],
		hobbies: [
      "Bird watching. Despite having a hard time sneaking up on birds due to his large brutish figure.",
      "Likes wearing colors that clash against his blueish skin. Despite it making him stick out like a sore thumb when going bird watching.",
      "Yelling loudly.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    urlName: "anna",
    age: 23,
    job: "Model",
    employer: "species-inclusive fashion magazine, MONST",
    race:"Dark Elf",
    description:[
      "Abandoned by her family as a baby, Anna was named and raised by human farmers who found her crying in the forest. Thus, Anna grew up with human values and culture but never felt like she belonged. Her above average height and exotic complexion made her stand out in the village amongst the humans.",
      "She moved to the city in search of other dark elves. Decided to come onto the show as a latch ditch effort to find any information on her childhood before being adopted.",
    ],
		hobbies:[
      "Haggling.",
      "Finding good deals when shopping.",
      "Getting a massage. Going to the spa.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    urlName: "korelin",
    age: 24,
    job: "Mechanic",
    employer: "Tregaron Dwarven Auto Body",
    race:"Dwarf",
    description:[
      "Youngest daughter in a long lineage of alcohol-loving Bottleguard mechanics. Korelin can easily drink more than creatures three/four times her size. Often the first to enter a bar and the last to be tossed out.",
      "Enjoys drinking beer, wine, spirits, basically anything with alcohol in it. Often found at the local pub once her shift is finished. Or passed out drunk in the bench outside her workshop from drinking the night before.",
    ],
    hobbies:[
      "Drinking. Duh.",
      "Betting on who can out-drink who.",
      "Turkey legs",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
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
    name: "Rosamund Galbassi",
    urlName: "rosamund",
    age: 27,
    job: "Foot Model",
    employer: "Big Magazine",
    race:"Monopod",
    description:[
      "Monopods are very fast despite only having one leg. They are also extremely stable due to the large size of their foot which makes their center of gravity much lower to the ground. By jumping forward with the legs in front, the large weight of the leg can act almost like a swing which propels them forward into their next step.",
      "Rosamund works as a foot model for plus sized footwear for large creatures. Came on the show to find a partner who can wear the all the other leftover shoes that she can't wear.",
    ],
    hobbies:[
      "Cosplay. Especially really creative ones involving only one leg. Like a table lamp, a table football player, amongst others.",
      "Enjoys shopping for shoes.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "美脚モデル",
    japaneseName: "ロザムンド・ガルバッシー",
    image: {
      url: "/images/members/characters10.jpg",
      name: "characters10.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Robin Stringsworth",
    urlName: "robin",
    age: 19,
    job: "Server",
    employer: "La Criada Café",
    race:"Talking Puppet",
    description:[
      "Comes from a family of magical puppets that a famous wizard gave life to. Nobody knows who the wizard is. But family legends say that the wizard always had a handmade wooden pipe in his mouth.",
      "Doesn't need any water or food to live and therefore cannot grow fatter or skinnier. Likewise, cannot grow older in age. The Stringsworth family instead uses wood varnish to keep their body parts looking shiny.",
    ],
    hobbies:[
      "Enjoys dressing up in goth lolita fashion.",
      "Likes swapping clothes.",
      "Has a large wardrobe full of random articles of clothing from different eras.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "メードカフェの店員",
    japaneseName: "ロビン・ストリングズワース",
    image: {
      url: "/images/members/characters11.jpg",
      name: "characters11.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Dorpip Wadlezedle",
    urlName: "dorpip",
    age: 23,
    job: "Comedian",
    employer: false,
    race:"Gnome",
    description:[
      "With a surname like Wadlezedle, Dorpip believes that he was born to be a comedian. However, his family of engineers and inventors disagree wholeheartedly and look upon him as the black sheep of the family.",
      "Takes every opportunity he can get to crack a joke. Even at the cost of the relationships in his life. Sometimes doesn't know when to stop or turn off the joking. Dresses like a garden gnome as a part of his comedy act.",
    ],
    hobbies:[
      "Making everyone laugh. Sometimes at the expense of himself.",
      "Dispelling awkward tensions with jokes.",
      "Fart jokes.",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "お笑い芸人",
    japaneseName: "ドルピップ・ワドルゼドル",
    image: {
      url: "/images/members/characters12.jpg",
      name: "characters12.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
  },
  {
    name: "Bizz Hagglefeet",
    urlName: "bizz",
    age: 15,
    job: "Banker",
    employer: "the Bank of New Cresthill",
    race:"Goblin",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "銀行家",
    japaneseName: "ビズ・ハグルフィート",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Seji Toomin",
    urlName: "seji",
    age: 22,
    job: "Lawyer",
    employer: "WT&T Associates",
    race:"Troll",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "弁護士",
    japaneseName: "セジ・トゥーミン",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Susom the Giant",
    urlName: "susom",
    age: 50,
    job: "Construction Worker",
    employer: "Onyx Construction & Demolition",
    race:"Giant",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "建設労働者",
    japaneseName: "巨人のスソム",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Hansan Snekker",
    title: "Hansan Snekker, the Wizard",
    urlName: "hansan",
    age: 31,
    job: "Wizard",
    employer: false,
    race:"Human",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "魔法使い",
    japaneseName: "ハンサン・スネッカー",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Soh",
    urlName: "soh",
    age: 24,
    job: "Printer",
    employer: "Unicorn Graphics",
    race:"Unicorn",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "印刷人",
    japaneseName: "ソゥ",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Grodrot, The Hungry",
    urlName: "grodrot",
    age: 65,
    job: "Chef",
    employer: "L'oeuf Restaurant",
    race:"Wyvern",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "シェフ",
    japaneseName: "空腹のグロドット",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Gingernuts Goodyhug",
    urlName: "gingernuts",
    age: 19,
    job: "Convenience Store Part-timer",
    employer: "6-Ten Convenience",
    race:"Gingerbread Being",
    description:[
      "",
      "",
      "",
    ],
		hobbies: [
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "コンビニフリーター",
    japaneseName: "ジンジャーナッツ・グディハグ",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Celestia Bernard",
    urlName: "celestia",
    age: 26,
    job: "Artist",
    employer: false,
    race:"Bicorn",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "美術家",
    japaneseName: "セレチア・バーナード",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Elias & Maya Dimakos",
    urlName: "dimakos",
    age: 25,
    job: "Accountant / Freelance Artist",
    employer: "Better Calculations Business / Self",
    race:"Gemini",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "会計士 / フリーランスアーティスト",
    japaneseName: "エリアス＆マヤ・ディマコス",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: 'Domination "Dommy" Armor Set',
    urlName: "dommy",
    age: "???",
    job: "Security Guard",
    employer: "Yicoran Bank",
    race:"Knight Armor",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "銀行の警備員",
    japaneseName: "覇業の鎧、ハギちゃん",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: 'Arya Jensen',
    urlName: "arya",
    age: 29,
    job: "Minister",
    employer: "Church of the New New World",
    race:"Sea Monk",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "司祭",
    japaneseName: "アルヤ・ジェンセン",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Nycolas O'Sullivan",
    urlName: "nycolas",
    age: 21,
    job: "Jockey (Horse Racer)",
    employer: "O'Sullivan Farms",
    race:"Dullahan",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "騎手",
    japaneseName: "ニコラス・オサリバン",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: true,
  },
  {
    name: "Brigit Ní Colla",
    urlName: "brigit",
    age: 22,
    job: "Model / Bank Teller",
    employer: "Bank O'Rainbows",
    race:"Leprechan",
    description:[
      "",
      "",
      "",
    ],
		hobbies:[
      "",
      "",
      "",
    ],
    japaneseDescription:[
      "",
      "",
      "",
    ],
    japaneseHobbies:[
      "",
      "",
      "",
    ],
    japaneseJob: "モデル / 窓口係",
    japaneseName: "ブリジェット・ニコラ",
    image: {
      url: "/images/members/temp.png",
      name: "temp.png",
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
  var rando = allCharacters[Math.floor(Math.random() * allCharacters.length)];
  if ((notThisPerson && rando.name === notThisPerson) || rando.ignoreInRandom){
    return getRandomPerson(notThisPerson);
  }
  return rando;
}

//return details of a specific person or a random one if cant find
export function getSpecificPerson(personName){

  //search for them
  for (let i = 0; i < allCharacters.length ; i++){
    if (allCharacters[i].name === personName){
      return allCharacters[i];
    }
  }

  return false;
}

//return details of a specific person by url name
export function getSpecificPersonByURL(urlName){

  //search for them
  for (let i = 0; i < allCharacters.length ; i++){
    if (allCharacters[i].urlName === urlName){
      return allCharacters[i];
    }
  }

  return false;
}

//returns details of all characters except the ones who need to be ignored
export function getAllFinishedPeople(random){
  let removedIgnoredChars = allCharacters.filter((e)=>{
    return !e.ignoreInRandom;
  })
  if (random) {
    return shuffle(removedIgnoredChars)
  }
  else {
    return removedIgnoredChars;
  }
}

//returns details of all characters even the ones not finished
export function getAllCharacters(random){
  let removeWonmin = allCharacters.filter((e)=>{
    return e.name !== "Wonmin Lee";
  });
  if (random) {
    return shuffle(removeWonmin)
  }
  else {
    return removeWonmin;
  }
}

//returns the latest person
export function getLatestPerson(){
  let removedIgnoredChars = getAllFinishedPeople();
  return removedIgnoredChars[removedIgnoredChars.length - 1];
}
