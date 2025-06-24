import { useState, useEffect } from "react";

export default function useWindowSize () {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Check if running on client (browser)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Set initial size
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Clean up on unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return windowSize;
};
