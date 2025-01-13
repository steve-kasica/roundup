import './App.css'

// import top-level app components
import TableStack from "./components/TableStack";
import TablePreview from "./components/TablePreview";

import { useSelector, useDispatch } from 'react-redux';
import { setSidebarStatus, SIDEBAR_CLOSED, SIDEBAR_SOURCE_COLUMNS, SIDEBAR_SOURCE_TABLES } from './data/uiSlice';
import WorkflowSelector from './components/AppSidebar/WorkflowSelector';

import NavigationRail from './components/NavigationRail';

import Grid from '@mui/material/Grid2';
import ColumnSelector from './components/ColumnSelector';

import { ThemeProvider } from '@mui/material/styles';

import theme from "./themes/theme-default";

function DynamicComponent({sidebarStatus}) {
  switch(sidebarStatus) {
    case SIDEBAR_SOURCE_TABLES: return <WorkflowSelector />;
    case SIDEBAR_SOURCE_COLUMNS: return <ColumnSelector />;
  }
}

function App() {
  const sidebarStatus = useSelector(({ui}) => ui.sidebarStatus);

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={0.5}>
        <Grid size={12} sx={{borderBottom: "1px solid #ddd"}}>
          Open Roundup
        </Grid>
        <Grid size={1} sx={{
          height: "100vh",
          borderRight: "1px solid #ddd"
        }}>
          <NavigationRail></NavigationRail>
        </Grid>
        <Grid size={3} sx={{
          height: "100vh",
          overflowY: "scroll",
          borderRight: "1px solid #ddd"
        }}>
          <DynamicComponent sidebarStatus={sidebarStatus}></DynamicComponent>
        </Grid>
        <Grid size={6}>
          <TableStack />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App