/**
 * App.jsx
 * ---------------------------------------------------------
 * Follows a supproting pane layout (https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
 */
import './App.css'

// import top-level app components
import TableStack from "./components/TableStack";
import TablePreview from "./components/TablePreview";

import { useSelector } from 'react-redux';
import { setSidebarStatus, SIDEBAR_CLOSED, SIDEBAR_SOURCE_COLUMNS, SIDEBAR_SOURCE_TABLES } from './data/uiSlice';
import ImportTables from "./components/ImportTables"

import NavigationRail from './components/NavigationRail';

import Grid from '@mui/material/Grid2';

import { ThemeProvider } from '@mui/material/styles';

import theme from "./themes/theme-default";

const APP_TITLE = "Open Roundup (demo)"

function App() {
  const sidebarStatus = useSelector(({ui}) => ui.sidebarStatus);

  return (
    <ThemeProvider theme={theme}>
      <Grid container spacing={1}>
        <Grid size={12} sx={{borderBottom: "1px solid #ddd"}}>
          {APP_TITLE}
        </Grid>
        <Grid size={1} sx={{
          height: "100vh"
        }}>
          <NavigationRail />
        </Grid>
        <Grid size={11} sx={{padding: "10px"}}>
          <ImportTables />
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App