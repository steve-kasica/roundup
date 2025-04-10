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
import {SupportingPane} from './layouts';
import NavigationRail from './components/NavigationRail';
import SourceTables from './components/SourceTables';
import CompositeTableSchema from './components/CompositeTableSchema';
import OperationDetail from "./components/OperationDetail";
import OperationsList from './components/OperationsList';

function App() {
  const {stage} = useSelector(({ui}) => ui);

  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
        <SupportingPane 
          navigation={
            <NavigationRail currentStage={stage} />
          }
          primaryContent={<SourceTables />}
          secondaryContent={<>
            <CompositeTableSchema />
            <OperationsList />
            <OperationDetail />                                        
          </>}
        />
      </DndProvider>
    </ThemeProvider>
  );
}

export default App