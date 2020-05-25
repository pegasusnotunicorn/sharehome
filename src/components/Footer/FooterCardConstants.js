const memberCards = [
  {
    name: "Wonmin Lee",
    age: 28,
    job: "Game Developer",
    japaneseName: "リー・ウォンミン",
    image: {
      url: "/images/members/member_wonmin.jpg",
    },
  },
  {
    name: "Lahee Hong",
    age: 35,
    job: "Designer",
    japaneseName: "ホン・ラヒ",
    image: {
      url: "/images/members/member_lahee.jpg",
    },
  },
  {
    name: "Peter Valdez",
    age: 28,
    job: "Developer",
    japaneseName: "ピーター",
    image: {
      url: "/images/members/member_peter.jpg",
    },
  },
  {
    name: "Kaijian Gao",
    age: 30,
    job: "Developer",
    japaneseName: "ガオ",
    image: {
      url: "/images/members/member_gao.jpg",
    },
  },
]

//return the details of a random member
export function getRandomMember(){
  return memberCards[Math.floor(Math.random() * memberCards.length)];
}

//return details of a specific member or a random one if cant find
export function getSpecificMember(memberName){
  for (let i = 0; i < memberCards.length ; i++){
    if (memberCards[i].name === memberName){
      return memberCards[i];
    }
  }
  return memberCards[Math.floor(Math.random() * memberCards.length)];
}
