export interface CardMainStyle {
  width: string;
  height: string;
  fontSize: string;
  zIndex?: number;
  transition?: string;
  position?: "static" | "relative" | "absolute" | "fixed" | "sticky";
  transform?: string;
  left?: string;
  bottom?: string;
  cursor?: string;
}

export interface DirectionEpisodeData {
  type: string;
  description: string;
}
