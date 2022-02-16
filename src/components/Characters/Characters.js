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
 	 	type: "member",
  },
  {
    name: "Urg the Hacker",
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
    japaneseRace:"オーク",
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
 	 	type: "member",
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
    japaneseRace:"コカトリス",
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
 	 	type: "member",
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
    japaneseRace:"エルフ",
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
 	 	type: "member",
  },
  {
    name: "Köttr, the Grumpy",
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
    japaneseRace:"ドラゴン",
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
      credit: "https://www.fiverr.com/carolynfrank",
      objectPosition: "left",
    },
    ignoreInRandom: false,
 	 	type: "member",
  },
  {
    name: "Lydia Grimsbane",
    title: "The Witch",
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
    japaneseRace:"人間",
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
      credit: "https://www.fiverr.com/carolynfrank",
      objectPosition: "right",
    },
    ignoreInRandom: false,
 	 	type: "member",
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
    japaneseRace:"バシリスク",
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
 	 	type: "member",
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
    japaneseRace:"オーガ",
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
      credit: "https://www.fiverr.com/carolynfrank",
      objectPosition: "right",
    },
    ignoreInRandom: false,
 	 	type: "member",
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
    japaneseRace:"ダークエルフ",
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
      credit: "https://www.fiverr.com/carolynfrank",
    },
    ignoreInRandom: false,
 	 	type: "member",
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
    japaneseRace:"ドワーフ",
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
 	 	type: "member",
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
    japaneseRace:"モノポッド",
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
 	 	type: "member",
  },
  {
    name: "Robin Stringsworth",
    urlName: "robin",
    age: 19,
    job: "Waitress",
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
    japaneseRace:"生き人形",
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
 	 	type: "member",
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
    japaneseRace:"ノーム",
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
 	 	type: "member",
  },
  {
    name: "Gingernuts Goodyhug",
    urlName: "gingernuts",
    age: 19,
    job: "Part-timer",
    employer: "6-Ten Convenience",
    race:"Gingerbread Being",
    description:[
      "Needs to constantly change his body parts to avoid rotting. Can swap out body parts with new cookie limbs. Really likes getting a sugar high. Basically a stoner. Always has a light dust of white powdered sugar underneath his nose. Sometimes enjoys eating parts of his own body when there are no other options available.",
      "Legend says that Gingerbread Beings were made by magical witches who were really into baking and getting high off of pixie dust.",
    ],
		hobbies: [
      "Stealing sugary food from work.",
      "Movie theaters. Especially after the movie is over and everyone leaves their food behind.",
      "Sitting in cotton candy machines.",
    ],
    japaneseRace:"ジンジャーブレッド人間",
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
      url: "/images/members/characters13.jpg",
      name: "characters13.jpg",
      width: 2000,
      height: 1200,
      credit: "https://www.fiverr.com/carolynfrank"
    },
    ignoreInRandom: false,
 	 	type: "member",
  },
  {
    name: "Bizz Hagglefeet",
    urlName: "bizz",
    age: 15,
    job: "Banker",
    employer: "the Bank of New Cresthill",
    race:"Goblin",
    description:[
      "Goblins reach adulthood and physical maturity around age 8. They are often named after their accomplishments in fields such as economics or con-artistry.",
      "Bizz always wears a bowtie even on his worst days. Really good with numbers and really good with people. Doesn't need a calculator for even the most complex of calculations. Has an excellent memory and can recite anyone's birthday after hearing it once, even years later.",
    ],
		hobbies:[
      "Calculus.",
      "Watching pickup artist videos.",
      "Memory games.",
      "Taking IQ quizzes online.",
    ],
    japaneseRace:"ゴブリン",
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
 	 	type: "member",
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
    japaneseRace:"トロール",
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
 	 	type: "member",
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
    japaneseRace:"巨人",
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
 	 	type: "member",
  },
  {
    name: "Hansan Snekker",
    title: "The Wizard",
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
    japaneseRace:"人間",
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
 	 	type: "member",
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
    japaneseRace:"ユニコーン",
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
 	 	type: "member",
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
    japaneseRace:"ワイバーン",
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
 	 	type: "member",
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
    japaneseRace:"バイコーン",
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
 	 	type: "member",
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
    japaneseRace:"ジェミニ",
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
 	 	type: "member",
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
    japaneseRace:"騎士の鎧",
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
 	 	type: "member",
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
    japaneseRace:"シーモンク",
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
 	 	type: "member",
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
    japaneseRace:"デュラハン",
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
 	 	type: "member",
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
    japaneseRace:"レプラコーン",
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
 	 	type: "member",
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
      let prevIndex = (i - 1 < 0) ? 0 : i - 1;
      let nextIndex = (i + 1 >= allCharacters.length) ? allCharacters.length - 1 : i + 1;
      return {
        ...allCharacters[i],
        index: i,
        total: allCharacters.length - 1,    //ignore wonmin
        prevCharURL: (allCharacters[prevIndex].ignoreInRandom) ? false : allCharacters[prevIndex].urlName,
        nextCharURL: (allCharacters[nextIndex].ignoreInRandom) ? false : allCharacters[nextIndex].urlName,
      };
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
