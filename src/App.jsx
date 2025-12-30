/**
 * @fileoverview Root application component for Roundup UI.
 * @module App
 *
 * Main entry point that configures global providers and renders the
 * primary application layout. Handles theming and drag-and-drop setup.
 *
 * Features:
 * - Material-UI theme provider with custom theme
 * - React DnD provider with HTML5 backend for drag-and-drop
 * - Custom drag layer for visual drag feedback
 * - Supporting pane layout as main content area
 *
 * @example
 * import App from './App';
 * <App />
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
