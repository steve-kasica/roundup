/**
 * @fileoverview HighlightText Component
 *
 * A text highlighting component that searches for a pattern within text and highlights
 * the first match with custom styling. Case-insensitive search with visual emphasis
 * on matched substring.
 *
 * Features:
 * - Case-insensitive pattern matching
 * - Custom styling for highlighted text
 * - Graceful handling of no matches
 * - Typography integration
 * - PropTypes validation
 *
 * @module components/ui/HighlightText
 *
 * @example
 * <HighlightText
 *   pattern="search"
 *   text="This is a searchable text"
 *   matchSx={{ backgroundColor: 'yellow', fontWeight: 'bold' }}
 * />
 */

import { Typography } from "@mui/material";
import PropTypes from "prop-types";

export default function HighlightText({ pattern, text, matchSx }) {
  text = String(text);
  const haystack = text.toLowerCase();
  const needle = pattern.toLowerCase();

  if (!haystack.includes(needle)) {
    return <>{text}</>;
  } else {
    // There is a match on the first occurence
    const start = haystack.indexOf(needle);
    const stop = start + needle.length;

    const beginning = text.slice(0, start);
    const middle = text.slice(start, stop);
    const end = text.slice(stop);

    return (
      <>
        <Typography component={"span"}>
          {beginning}
          <Typography component={"span"} className="highlight" sx={matchSx}>
            {middle}
          </Typography>
          {end}
        </Typography>
      </>
    );
  }
}

HighlightText.propTypes = {
  pattern: PropTypes.string.isRequired,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
