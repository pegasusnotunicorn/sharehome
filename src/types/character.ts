export interface CharacterImage {
  url: string;
  name: string;
  width: number;
  height: number;
  credit: string;
  objectPosition?: string;
  x?: number;
  y?: number;
}

export interface Character {
  name: string;
  urlName: string;
  age: number | string;
  title?: string;
  job: string;
  job2?: string;
  employer: string | false;
  employer2?: string;
  race: string;
  emoji: string[];
  description: string[];
  hobbies: string[];
  image: CharacterImage;
  ignoreInRandom: boolean;
  type: "member" | "commentator";
  japaneseName?: string;
}

export interface CharacterWithNav extends Character {
  index: number;
  total: number;
  prevCharURL: string | false;
  nextCharURL: string | false;
}
