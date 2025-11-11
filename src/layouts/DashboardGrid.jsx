import { lazy, Suspense } from "react";
import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
// import Drawer from "@mui/material/Drawer";
// import { useDispatch, useSelector } from "react-redux";
// import { COMPONENT_ID as FOCUSED_TABLE_VIEW } from "../components/TablePeek/TablePeek";
// import { COMPONENT_ID as COLUMN_INDEX_VALUES_COMPONENT } from "../components/ColumnIndexDetails";
// import { Button, IconButton } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

// const drawerComponentMap = {};
// drawerComponentMap[COLUMN_INDEX_VALUES_COMPONENT] = {
//   component: lazy(() =>
//     import("../components/ColumnValueMatrix/SelectedColumns")
//   ),
//   anchor: "right",
//   label: "Compare Values",
// };

// drawerComponentMap[FOCUSED_TABLE_VIEW] = {
//   component: lazy(() => import("../components/TablePeek/TablePeek")),
//   anchor: "bottom",
//   label: "Table Peek",
// };

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
  // let drawer;
  // const dispatch = useDispatch();}

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
      {/* <Drawer
        anchor={drawer ? drawer.anchor : undefined}
      >
        <Box
          sx={{
            padding: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            className="drawer-header"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid black",
              position: "relative",
            }}
          >
            <Typography variant="h5">
              {drawer ? drawer.label : "Drawer"}
            </Typography>
            <IconButton
              aria-label="close drawer"
              onClick={() => {
              }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Suspense fallback={<div>Loading...</div>}>
            {drawer && <drawer.component />}
          </Suspense>
        </Box>
      </Drawer> */}

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
