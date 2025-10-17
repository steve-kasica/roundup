/**
 * App.jsx
 *
 * This file handles theming, and layout logic depending on user's state in
 * the overall roundup workflow.
 *
 */
import "./App.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./themes/theme-default";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SupportingPane from "./layouts/SupportingPane";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <SupportingPane />
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
