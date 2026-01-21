import { Box, Typography } from "@mui/material";
import { withColumnData } from "../HOC";

const ColumnLabel = ({
  // Props passed from withColumnData HOC
  id,
  name,
  databaseName,
  hoverColumn,
  unhoverColumn,
  // Props passed from parent
  isKey = false,
  onClick,
}) => {
  const text = name || databaseName || id;
  return (
    <Box sx={{ containerType: "inline-size" }} onClick={onClick}>
      <Typography
        variant="data-secondary"
        component={"div"}
        onMouseEnter={hoverColumn}
        onMouseLeave={unhoverColumn}
        title={text}
        sx={{
          fontSize: "0.6rem",
          userSelect: "none",
          // Multiple transform commands should be space-separated in a single string
          transform: "rotate(0deg)",
          transformOrigin: "left bottom",
          textAlign: "center",
          fontWeight: isKey ? "bold" : "normal",
          marginBottom: "2.5px",
          marginTop: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          "@container (width < 50px)": {
            textAlign: "left",
            transform: `rotate(-10deg) translateX(20px)`,
            marginTop: "2.5px",
          },
          "@container (width < 45px)": {
            transform: "rotate(-20deg) translateX(20px) translateY(5px)",
            textAlign: "left",
            marginTop: "5px",
          },
          "@container (width < 40px)": {
            transform: "rotate(-30deg) translateX(20px) translateY(8px)",
            textAlign: "left",
            marginTop: "7.5px",
          },
          "@container (width < 35px)": {
            transform: "rotate(-40deg) translateX(12px) translateY(9px)",
            textAlign: "left",
            marginTop: "10px",
          },
          "@container (width < 30px)": {
            transform: "rotate(-50deg) translateX(12px) translateY(10px)",
            textAlign: "left",
            marginTop: "12.5px",
          },
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

const EnhancedColumnLabel = withColumnData(ColumnLabel);

export { EnhancedColumnLabel, ColumnLabel };
