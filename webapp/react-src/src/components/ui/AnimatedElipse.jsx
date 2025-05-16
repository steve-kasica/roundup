import { useState, useEffect } from "react";

const AnimatedEllipsis = ({
  speed = 250, // in ms
  elipseLength = 3,
}) => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < elipseLength ? prev + "." : ""));
    }, speed);

    return () => clearInterval(interval);
  }, []);
  return (
    <span
      style={{
        display: "inline-block",
        minWidth: `${elipseLength}ch`,
        fontFamily: "monospace",
        textAlign: "left",
      }}
    >
      {dots}
    </span>
  );
};

export default AnimatedEllipsis;
