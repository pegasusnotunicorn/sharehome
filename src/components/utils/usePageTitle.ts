import { useEffect } from "react";

// The browser tab's title for a page, set when it's shown (or when it changes)
export default function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
