import { lazy, Suspense } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import { selectDrawerContents } from "../data/slices/uiSlice/uiSliceSelectors";
import { useDispatch, useSelector } from "react-redux";
import { setDrawerContents } from "../data/slices/uiSlice/uiSlice";
import { COMPONENT_ID as FOCUSED_TABLE_VIEW } from "../components/TableView/SelectedTableView";

const drawerComponentMap = {};
drawerComponentMap["IndexUniqueValues"] = {
  component: lazy(() =>
    import("./../components/OperationDetail/StackDetail/IndexUniqueValues")
  ),
  anchor: "right",
};

drawerComponentMap[FOCUSED_TABLE_VIEW] = {
  component: lazy(() => import("./../components/TableView/SelectedTableView")),
  anchor: "bottom",
};

/**
 * DashboardGrid component that arranges components in a responsive grid
 * @param {Object} props - Component props
 * @param {Array} props.components - Array of React components to display in the grid
 * @param {Array} props.titles - Optional array of titles for each component
 * @param {string} props.dashboardTitle - Dashboard title
 * @param {number} props.spacing - Spacing between grid items
 * @param {number} props.cardElevation - Elevation level for cards
 * @returns {JSX.Element} Dashboard grid layout
 */
const DashboardGrid = ({
  components = [],
  titles = [],
  dashboardTitle = "Dashboard",
  spacing = 2,
  cardElevation = 1,
}) => {
  let drawer;
  const dispatch = useDispatch();

  const drawerContents = useSelector(selectDrawerContents);
  // Check if drawerContents is in the componentMap
  if (drawerContents) {
    drawer = drawerComponentMap[drawerContents];
  }

  // Use provided titles or generate placeholders
  const gridTitles = [...titles];
  while (gridTitles.length < components.length) {
    gridTitles.push(`Panel ${gridTitles.length + 1}`);
  }

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <Drawer
        anchor={drawer ? drawer.anchor : undefined}
        open={Boolean(drawerContents)}
        onClose={() => dispatch(setDrawerContents(null))}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {drawer && <drawer.component />}
        </Suspense>
      </Drawer>

      <Grid container spacing={spacing}>
        {components.map((Component, index) => (
          <Grid xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{ height: "100%", minHeight: 200 }}
              elevation={cardElevation}
            >
              <CardContent>
                {gridTitles[index] && (
                  <Typography variant="h6" component="div" gutterBottom>
                    {gridTitles[index]}
                  </Typography>
                )}
                {<Component />}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardGrid;
