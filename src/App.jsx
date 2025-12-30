/**
 * App.jsx
 *
 * This file handles theming, and layout logic depending on user's state in
 * the overall roundup workflow.
 *
 */
import "./App.css";
import { ThemeProvider } from "@mui/material/styles";
import { themeDefault } from "./themes";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import SupportingPane from "./layouts/SupportingPane";
import CustomDragLayer from "./components/CustomDragLayer";

function App() {
  return (
    <ThemeProvider theme={themeDefault}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <SupportingPane />
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
