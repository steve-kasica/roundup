/**
 * App.jsx
 * ---------------------------------------------------------
 * Follows a supproting pane layout (https://m3.material.io/foundations/layout/canonical-layouts/supporting-pane)
 */
import './App.css'
import ImportTables from "./components/ImportTables"
import NavigationRail from './components/NavigationRail';
import Grid from '@mui/material/Grid2';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./themes/theme-default";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const APP_TITLE = "Open Roundup (demo)"

function App() {

  return (
    <ThemeProvider theme={theme}>
      <DndProvider backend={HTML5Backend}>
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
      </DndProvider>
    </ThemeProvider>
  );
}

export default App