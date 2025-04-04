/**
 * App.jsx
 * 
 * This file handles theming, and layout logic depending on user's state in 
 * the overall roundup workflow.
 * 
 */
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./themes/theme-default";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';
import { STAGE_ARRANGE_TABLES, STAGE_CONFIG_SOURCES, STAGE_REFINE_OPS } from './data/uiSlice';
import {ListDetail, SupportingPane} from './layouts';
import NavigationRail from './components/NavigationRail';
import SourceTables from './components/SourceTables';
import CompositeTableSchema from './components/CompositeTableSchema';
import OperationDetail from "./components/OperationDetail";
import WorkflowDetail from './components/WorkflowDetail';
import OperationsList from './components/OperationsList';

function App() {
  const {stage} = useSelector(({ui}) => ui);

  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        {
          (stage === STAGE_CONFIG_SOURCES) ? (
            <ListDetail 
              navigation={
                <NavigationRail currentStage={stage} />
              }
              firstPane={
                <SourceTables />
              }
              secondPane={
                <WorkflowDetail />
              }
            />
          ) : (
            <SupportingPane 
              navigation={
                <NavigationRail currentStage={stage} />
              }
              primaryContent={
                (stage === STAGE_ARRANGE_TABLES) ? (
                  <SourceTables />
                ) : (stage == STAGE_REFINE_OPS) ? (
                  <>
                    <CompositeTableSchema />
                    <OperationsList />                  
                  </>
                ) : null
              }
              secondaryContent={
                (stage === STAGE_ARRANGE_TABLES) ? (
                  <CompositeTableSchema />
                ) : (stage === STAGE_REFINE_OPS) ? (
                  <OperationDetail />
                ) : null
              }
            />
          )
        }
      </DndProvider>
    </ThemeProvider>
  );
}

export default App