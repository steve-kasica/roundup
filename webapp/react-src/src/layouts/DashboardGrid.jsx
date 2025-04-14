import React from 'react';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

/**
 * DashboardGrid component that arranges components in a 2x2 grid
 * @param {Object} props - Component props
 * @param {Array} props.components - Array of React components to display in the grid
 * @param {Array} props.titles - Optional array of titles for each component
 * @param {string} props.dashboardTitle - Dashboard title
 * @returns {JSX.Element} Dashboard grid layout
 */
const DashboardGrid = ({ 
  components = [], 
  titles = [], 
  dashboardTitle = 'Dashboard',
  spacing = 2,
  cardElevation = 1
}) => {
  // Make sure we have at least 4 components (or empty placeholders)
  const gridComponents = [...components];
  while (gridComponents.length < 4) {
    gridComponents.push(
      <Typography color="text.secondary" variant="body2">
        Empty panel
      </Typography>
    );
  }

  // Use provided titles or generate placeholders
  const gridTitles = [...titles];
  while (gridTitles.length < 4) {
    gridTitles.push(gridTitles.length > 0 ? `Panel ${gridTitles.length + 1}` : '');
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {dashboardTitle && (
        <Typography variant="h4" component="h1" gutterBottom>
          {dashboardTitle}
        </Typography>
      )}
      
      <Grid container spacing={spacing}>
        {gridComponents.slice(0, 4).map((Component, index) => (
          <Grid xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', minHeight: 200 }} elevation={cardElevation}>
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