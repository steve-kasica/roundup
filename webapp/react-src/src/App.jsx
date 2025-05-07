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
import SourceTables from "./components/SourceTables";
import CompositeTableSchema from "./components/CompositeTableSchema";
import OperationDetail from "./components/OperationDetail";
import OperationsList from "./components/OperationsList";
import CustomDragLayer from "./CustomDragLayer";
import ColumnDetail from "./components/ColumnDetail";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer />
        <DashboardGrid
          components={[
            SourceTables,
            CompositeTableSchema,
            OperationsList,
            OperationDetail,
            ColumnDetail,
          ]}
          titles={[
            "Source Tables",
            "Composite Table Schema",
            "Operations List",
            "Operations Detail",
            "Column Detail",
          ]}
          dashboardTitle="Open Roundup"
        />
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
