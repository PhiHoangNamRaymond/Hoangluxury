import { useEffect, useRef, useState } from "react";

// Keep content in the DOM; only defer decorative media, not headings or links.
export default function useNearViewport({ rootMargin = "500px", once = true } = {}) {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current) return undefined;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return undefined;
    }
    const observer = new window.IntersectionObserver(([entry]) => {
      setNear(entry.isIntersecting);
      if (entry.isIntersecting && once) observer.disconnect();
    }, { rootMargin });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin, once]);
  return [ref, near];
}
