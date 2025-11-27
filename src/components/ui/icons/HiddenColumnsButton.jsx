// See https://www.unicode.org/charts/nameslist/n_2B00.html
import { IconButton } from "@mui/material";
// import { ArrowLeft, ArrowRight } from "@mui/icons-material";

const HiddenColumnsButton = ({ count, ...props }) => {
  return (
    <IconButton
      size="small"
      tabIndex={-1}
      {...props}
      sx={{
        position: "relative",
        "&::before": {
          content: `"${count}"`,
          background: "#ddd",
          borderRadius: "50%",
          padding: "2px 5px",
          position: "absolute",
          top: "-15px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "0.6rem",
          fontWeight: "bold",
          color: "primary.info",
          lineHeight: 1,
        },
        ...props.sx,
      }}
    >
      ⮕⬅
      {/* <ArrowRight size="small" width="0.8em" />
      |
      <ArrowLeft size="small" width="0.8em" /> */}
    </IconButton>
  );
};

export default HiddenColumnsButton;
