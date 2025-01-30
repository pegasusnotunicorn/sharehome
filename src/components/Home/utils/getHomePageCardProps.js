//max card width / size
//to determine how big the cards will be based on window width
const getHomePageCardProps = (cardType, width) => {
  let cardDividerByScreenWidth =
    width >= 1600
      ? 4.2
      : width >= 1200
      ? 3.7
      : width >= 900
      ? 2.7
      : width >= 700
      ? 2.2
      : 1.7;
  if (cardType !== "member") cardDividerByScreenWidth += 0.75;
  let cardWidth = Math.floor(width / cardDividerByScreenWidth);
  let cardTypeRatio = cardType === "member" ? 1.72 : 1.4;
  let cardHeight = cardWidth / cardTypeRatio;
  let fontSize = width >= 1400 ? 10 : width >= 900 ? 8 : 6;
  return {
    showFront: true,
    type: cardType,
    disableFlip: cardType !== "member",
    disableText: true,
    hideBack: cardType !== "member",
    cardBackName: cardType === "member",
    mainStyle: {
      //stuff needed for card size
      width: `${cardWidth}px`,
      height: `${cardHeight}px`,
      fontSize: `${fontSize}px`,
    },
  };
};

export default getHomePageCardProps;
