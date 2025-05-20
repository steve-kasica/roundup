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
import ColumnFacets from "./components/ColumnFacets";
import { useSelector } from "react-redux";
import { selectSelectedColumnIds } from "./data/slices/columnsSlice";

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
            // ColumnFacetContainer,
          ]}
          titles={[
            "Source Tables",
            "Composite Table Schema",
            "Operations List",
            "Operations Detail",
            "Column(s) Facets",
          ]}
          dashboardTitle="Open Roundup"
        />
      </DndProvider>
    </ThemeProvider>
  );
}

function ColumnFacetContainer() {
  const columnIds = useSelector(selectSelectedColumnIds);

  return columnIds.length > 0 ? <ColumnFacets columnIds={columnIds} /> : null;
}

export default App;
