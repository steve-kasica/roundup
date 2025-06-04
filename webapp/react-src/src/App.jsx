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
import { DashboardGrid } from "./layouts";
import TableSelector from "./components/TableSelector";
import CompositeTableSchema from "./components/CompositeTableSchema";
import OperationDetail from "./components/OperationDetail";
import OperationsList from "./components/OperationsList";
import CustomDragLayer from "./CustomDragLayer";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <DashboardGrid
          components={[
            TableSelector,
            CompositeTableSchema,
            OperationsList,
            OperationDetail,
          ]}
          titles={[
            "Source Tables",
            "Composite Table Schema",
            "Operations List",
            "Operations Detail",
          ]}
          dashboardTitle="Open Roundup"
        />
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
