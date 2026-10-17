import { useLocation } from "react-router";
import { SITE, pageMeta } from "../pageMeta";
import CustomHelmet from "./utils/CustomHelmet";

// the page's title, description and share image, from the list (a character's page sets its own)
const MetaTags = () => {
  const { pathname } = useLocation();
  const { title, description, image } = pageMeta(pathname);
  return <CustomHelmet title={title} splashImage={SITE + image.url} description={description} />;
};

export default MetaTags;
