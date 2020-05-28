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
    },
  },
]

//return the details of a random person
export function getRandomPerson(){
  return examplePeople[Math.floor(Math.random() * examplePeople.length)];
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
