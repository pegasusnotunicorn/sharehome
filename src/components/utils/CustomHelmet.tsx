import { useEffect, useRef } from "react";

interface CustomHelmetProps {
  title: string;
  description: string;
  splashImage?: string;
}

// The page's description and share tags (for search results and link previews): the ones index.html
// starts with, changed in place. Where more than one page part sets them (the site's, then a
// character's own), the one that came in last wins, until it goes.
type Tags = [attr: "name" | "property" | "itemprop", key: string, content: string][];
const tagsFor = ({ title, description, splashImage }: CustomHelmetProps): Tags => [
  ["name", "description", description],
  ["itemprop", "name", title],
  ["itemprop", "description", description],
  ["property", "og:title", title],
  ["property", "og:description", description],
  ["property", "og:url", window.location.origin + window.location.pathname /* (no tracking tags in a shared link) */],
  ["name", "twitter:title", title],
  ["name", "twitter:description", description],
  ...(splashImage
    ? ([
        ["itemprop", "image", splashImage],
        ["property", "og:image", splashImage],
        ["name", "twitter:image", splashImage],
      ] as Tags)
    : []),
];

const setTag = ([attr, key, content]: Tags[number]) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

// every part setting them, in the order they came in
const sets: { tags: Tags }[] = [];
const apply = () => sets[sets.length - 1]?.tags.forEach(setTag);

export const useHeadTags = (props: CustomHelmetProps) => {
  const mine = useRef<{ tags: Tags } | null>(null);
  useEffect(() => {
    const set = { tags: [] as Tags };
    mine.current = set;
    sets.push(set);
    return () => {
      sets.splice(sets.indexOf(set), 1);
      apply();
    };
  }, []);
  const { title, description, splashImage } = props;
  const path = window.location.pathname; // (for og:url)
  useEffect(() => {
    if (!mine.current) return;
    mine.current.tags = tagsFor({ title, description, splashImage });
    apply();
  }, [title, description, splashImage, path]);
};

const CustomHelmet = (props: CustomHelmetProps) => {
  useHeadTags(props);
  return null;
};

export default CustomHelmet;
