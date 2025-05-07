import Grid from "@mui/material/Grid2";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

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
  // Use provided titles or generate placeholders
  const gridTitles = [...titles];
  while (gridTitles.length < components.length) {
    gridTitles.push(`Panel ${gridTitles.length + 1}`);
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
      {dashboardTitle && (
        <Typography variant="h4" component="h1" gutterBottom>
          {dashboardTitle}
        </Typography>
      )}

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
