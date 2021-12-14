const examplePeople = [
  {
    name: "Wonmin Lee",
    age: 30,
    job: "Game Designer",
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
    japaneseName: "ウルグ・ザー・ハッカー",
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
    japaneseName: "コトル・ザー・グランピー",
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
]

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
