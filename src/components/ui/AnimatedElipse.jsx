/**
 * @fileoverview AnimatedEllipsis Component
 *
 * A simple animated loading indicator that displays an ellipsis with a configurable
 * number of dots that animate in sequence. Useful for indicating loading states or
 * ongoing processes.
 *
 * Features:
 * - Configurable animation speed
 * - Customizable ellipsis length
 * - Automatic cleanup of intervals
 * - Lightweight implementation
 *
 * @module components/ui/AnimatedElipse
 *
 * @example
 * <AnimatedEllipsis speed={250} elipseLength={3} />
 */

import { useState, useEffect } from "react";
import PropTypes from "prop-types";

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

AnimatedEllipsis.propTypes = {
  speed: PropTypes.number,
  elipseLength: PropTypes.number,
};

export default AnimatedEllipsis;
