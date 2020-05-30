const examplePeople = [
  {
    name: "Wonmin Lee",
    age: 28,
    job: "Game Developer",
    japaneseName: "リー・ウォンミン",
    image: {
      url: "/images/members/member_wonmin.jpg",
      name: "member_wonmin.jpg",
      width: 1467,
      height: 978,
      credit: "https://1minlee.com"
    },
  },
  {
    name: "Lahee Hong",
    age: 35,
    job: "Designer",
    japaneseName: "ホン・ラヒ",
    image: {
      url: "/images/members/member_lahee.jpg",
      name: "member_lahee.jpg",
      width: 1467,
      height: 978,
      credit: "https://1minlee.com"
    },
  },
  {
    name: "Peter Valdez",
    age: 28,
    job: "Developer",
    japaneseName: "ピーター",
    image: {
      url: "/images/members/member_peter.jpg",
      name: "member_peter.jpg",
      width: 1393,
      height: 929,
      credit: "https://1minlee.com"
    },
  },
  {
    name: "Kaijian Gao",
    age: 30,
    job: "Developer",
    japaneseName: "ガオ",
    image: {
      url: "/images/members/member_gao.jpg",
      name: "member_gao.jpg",
      width: 952,
      height: 631,
      credit: "https://1minlee.com"
    },
  },
  {
    name: "Mohamad Ruh",
    age: 25,
    job: "Researcher",
    japaneseName: "モハメッド",
    image: {
      url: "/images/members/member_mohammad.jpeg",
      name: "member_mohammad.jpeg",
      width: 1350,
      height: 900,
      credit: "https://unsplash.com/@planeteelevene",
    },
  },
  {
    name: "Chris Murray",
    age: 22,
    job: "Photographer",
    japaneseName: "クリス",
    image: {
      url: "/images/members/member_chris.jpeg",
      name: "member_chris.jpeg",
      width: 1230,
      height: 978,
      credit: "https://unsplash.com/@seemurray",
      y:0,
    },
  },
  {
    name: "Hayes Potter",
    age: 26,
    job: "Freelancer",
    japaneseName: "ヘイズ",
    image: {
      url: "/images/members/member_hayes.jpeg",
      name: "member_hayes.jpeg",
      width: 644,
      height: 951,
      credit: "https://unsplash.com/@hayespotter",
      y:-50,
    },
  },
  {
    name: "Leslie Colins",
    age: 22,
    job: "Freelancer",
    japaneseName: "ヘイズ",
    image: {
      url: "/images/members/member_leslie.jpeg",
      name: "member_leslie.jpeg",
      width: 644,
      height: 949,
      credit: "https://unsplash.com/@clesulie",
      y:-50,
    },
  },
  {
    name: "Michael Lulit",
    age: 19,
    job: "Student",
    japaneseName: "マイケル",
    image: {
      url: "/images/members/member_michael.jpeg",
      name: "member_michael.jpeg",
      width: 1350,
      height: 900,
      credit: "https://unsplash.com/@mlarosa97",
    },
  },
  {
    name: "Frank Codo",
    age: 26,
    job: "Musician",
    japaneseName: "フランク",
    image: {
      url: "/images/members/member_frank.jpeg",
      name: "member_frank.jpeg",
      width: 644,
      height: 951,
      credit: "https://unsplash.com/@byfoul",
      y:-125,
    },
  },
  {
    name: "Taylor Nix",
    age: 27,
    job: "Bartender",
    japaneseName: "テイラー",
    image: {
      url: "/images/members/member_taylor.jpeg",
      name: "member_taylor.jpeg",
      width: 634,
      height: 951,
      credit: "https://unsplash.com/@jtylernix",
      y:-25,
    },
  },
  {
    name: "Thu Tran",
    age: 23,
    job: "Singer",
    japaneseName: "テゥー",
    image: {
      url: "/images/members/member_thu.jpeg",
      name: "member_thu.jpeg",
      width: 992,
      height: 717,
      credit: "https://unsplash.com/@trung18tuoi",
    },
  },
  {
    name: "Emy Sylvette",
    age: 20,
    job: "Composer",
    japaneseName: "エミ",
    image: {
      url: "/images/members/member_emy.jpeg",
      name: "member_emy.jpeg",
      width: 1350,
      height: 900,
      credit: "https://unsplash.com/@priscilladupreez",
    },
  },
  {
    name: "Alina Agnessa",
    age: 21,
    job: "Aspiring Chef",
    japaneseName: "アリナ",
    image: {
      url: "/images/members/member_alina.jpeg",
      name: "member_alina.jpeg",
      width: 634,
      height: 951,
      credit: "https://unsplash.com/@patwwa",
      y: -125
    },
  },
  {
    name: "Alexandra Mare",
    age: 23,
    job: "Model",
    japaneseName: "アレクサンドラ",
    image: {
      url: "/images/members/member_alexandra.jpeg",
      name: "member_alexandra.jpeg",
      width: 1350,
      height: 900,
      credit: "https://unsplash.com/@espinarphography",
    },
  },
  {
    name: "Alexandra Mare",
    age: 23,
    job: "Model",
    japaneseName: "アレクサンドラ",
    image: {
      url: "/images/members/member_alexandra.jpeg",
      name: "member_alexandra.jpeg",
      width: 1350,
      height: 900,
      credit: "https://unsplash.com/@espinarphography",
    },
  },
  {
    name: "Riya Hira",
    age: 23,
    job: "CEO",
    japaneseName: "リヤ",
    image: {
      url: "/images/members/member_riya.jpeg",
      name: "member_riya.jpeg",
      width: 1350,
      height: 900,
      credit: "https://unsplash.com/@priscilladupreez",
    },
  },
]

//return the details of a random person
export function getRandomPerson(notThisPerson){
  var rando = examplePeople[Math.floor(Math.random() * examplePeople.length)];
  if (notThisPerson && rando.name === notThisPerson){
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
