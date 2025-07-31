import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

function ValueView({ value, matchCount }) {
  return (
    <Box
      sx={{
        textAlign: "left",
        border: "1px solid #ccc",
        borderRadius: "5px",
        px: 2,
        py: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: "medium", color: "#333", whiteSpace: "nowrap" }}
      >
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "#999" }}>
        {`${matchCount || 0} row${matchCount !== 1 ? "s" : ""}`}
      </Typography>
    </Box>
  );
}

ValueView.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  matchCount: PropTypes.number,
};

export default ValueView;
