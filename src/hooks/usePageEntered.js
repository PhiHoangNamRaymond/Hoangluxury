import { useEffect, useState } from "react";

export default function usePageEntered() {
  const [pageEntered, setPageEntered] = useState(false);

  useEffect(() => {
    let secondFrame = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setPageEntered(true));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return pageEntered;
}
