import { useState } from "react";
import {
  getRandomPerson,
  getSpecificPerson,
} from "../Characters/Characters";
import { pdfDimensions, getCoverFitObject } from "../utils/cardConstants";
import type { CardMainStyle } from "../../types/card";
import styles from "../../css/utils/cards.module.css";

interface CardFrontPersonProps {
  mainStyle: CardMainStyle;
  personName?: string;
  disableText?: boolean;
  enableQuestionMark?: boolean;
}

export const CardFrontPerson = (props: CardFrontPersonProps) => {
  const [cardPersonState] = useState(getRandomPerson());

  //check if there is a person name, if not get a random
  const cardPerson = props.personName
    ? getSpecificPerson(props.personName) || cardPersonState
    : cardPersonState;
  const disableText =
    typeof props.disableText !== "undefined" ? props.disableText : false;
  const enableQuestionMark = props.enableQuestionMark
    ? props.enableQuestionMark
    : false;

  //object position offset (ratio scales according to size of the card set in parent)
  const cardWidth = Number.parseInt(props.mainStyle.width);
  const cardHeight = Number.parseInt(props.mainStyle.height);
  const imageXY = getCoverFitObject(
    cardPerson.image.width,
    cardPerson.image.height,
    pdfDimensions.width,
    pdfDimensions.height
  );
  const cardXY = getCoverFitObject(
    cardPerson.image.width,
    cardPerson.image.height,
    cardWidth,
    cardHeight
  );
  const objectPositionX =
    typeof cardPerson.image.x !== "undefined"
      ? Math.round(cardPerson.image.x * (cardXY.width / imageXY.width)) + "px"
      : "50%";
  const objectPositionY =
    typeof cardPerson.image.y !== "undefined"
      ? Math.round(cardPerson.image.y * (cardXY.height / imageXY.height)) + "px"
      : "50%";

  let mainText: React.ReactNode = disableText ? (
    ""
  ) : (
    <>
      <div className={styles.memberCommCardShadow}></div>
      <div className={styles.memberCommCardText}>
        <div className={styles.memberCommCardMainText}>
          {cardPerson.name} ({cardPerson.age})
        </div>
        <div className={styles.memberCommCardSubText}>
          {cardPerson.job}&nbsp;
          <span className="japaneseName">{cardPerson.japaneseName}</span>
        </div>
      </div>
    </>
  );

  //enable question mark to signify random character card
  if (enableQuestionMark) {
    mainText = (
      <>
        <h1 className={styles.memberCommCardQuestionMark}>?</h1>
        <div className={styles.memberCommCardFullShadow}></div>
      </>
    );
  }

  return (
    <div className={styles.memberCommCardWrapper}>
      {mainText}
      <img
        loading="lazy"
        draggable={false}
        className={`${styles.memberCommCardImage} nopointerevent`}
        alt={"Image credit - " + cardPerson.image.credit}
        src={cardPerson.image.url}
        style={{
          objectPosition: objectPositionX + " " + objectPositionY,
          transition: "all 0.5s",
        }}
      />
    </div>
  );
};

export default CardFrontPerson;
