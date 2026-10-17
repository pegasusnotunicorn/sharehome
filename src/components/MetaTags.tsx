import { useLocation } from "react-router";
import { pageMeta } from "../pageMeta";
import useHeadTags from "./utils/useHeadTags";

// the page's title, description and share image, from the list (a character's page, and the
// not-found page, set their own over it)
const MetaTags = () => {
  const { pathname } = useLocation();
  useHeadTags(pageMeta(pathname), pathname);
  return null;
};

export default MetaTags;
