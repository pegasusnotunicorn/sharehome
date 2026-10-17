import { useEffect, useRef } from "react";
import { SITE, cleanPath, headTags, type HeadTag, type PageMeta } from "../../pageMeta";

// The page's tab title, description, share tags and canonical link (src/pageMeta.ts's headTags): the
// ones the page was sent with, changed in place, so there's only ever one of each. Where more than one
// part of the page sets them (the site's, from the address, then a character's page or the not-found
// page), the one that came in last wins, until it goes.
const setTag = ([attr, key, content]: HeadTag) => {
  const tag = attr === "rel" ? "link" : "meta";
  let el = document.head.querySelector<HTMLElement>(`${tag}[${attr}="${key}"]`);
  if (content === null) return el?.remove();
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(tag === "link" ? "href" : "content", content);
};

// every part setting them, in the order they came in
type Head = { title: string; tags: HeadTag[] } | null;
const sets: { head: Head }[] = [];
const apply = () => {
  const head = sets[sets.length - 1]?.head;
  if (!head) return;
  document.title = head.title;
  head.tags.forEach(setTag);
};

// path: the page's own address (the one it's at, by default)
export default function useHeadTags(meta: PageMeta, path = window.location.pathname) {
  const mine = useRef<{ head: Head } | null>(null);
  useEffect(() => {
    const set: { head: Head } = { head: null };
    mine.current = set;
    sets.push(set);
    return () => {
      sets.splice(sets.indexOf(set), 1);
      apply();
    };
  }, []);
  const { title, tab, description, noindex } = meta;
  const { url: image, width, height } = meta.image;
  const url = SITE + cleanPath(path);
  useEffect(() => {
    if (!mine.current) return;
    const page = { title, description, noindex, image: { url: image, width, height } };
    mine.current.head = { title: tab ?? title, tags: headTags(page, url) };
    apply();
  }, [title, tab, description, noindex, image, width, height, url]);
}

// the same, where it's only some pages that set them
export const HeadTags = ({ meta, path }: { meta: PageMeta; path?: string }) => {
  useHeadTags(meta, path);
  return null;
};
