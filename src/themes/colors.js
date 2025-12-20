import { lighten } from "@mui/material";

const loadingColor = "#fff3e0";
const selectedColor = "rgb(198, 228, 252)";
const hoverColor = lighten(selectedColor, 0.7);
const draggingColor = "#ff9800";
const dropTargetColor = "#4caf50";
const errorColor = "#f44336";
const focusedColor = "#fbc02d";

export default {
  loadingColor,
  selectedColor,
  hoverColor,
  draggingColor,
  dropTargetColor,
  errorColor,
  focusedColor,
};
