
import Grid from "@mui/material/Grid2"
import { Typography, IconButton, Box, Divider } from "@mui/material"

import ClosePopoverIcon from "@mui/icons-material/Close";  // aliased export

import BarChart from "./Visualizations/BarChart"
import { ascending, descending, format, sum } from "d3";

const formatPercent = format("0.2f");

export default function ColumnDetail({
    name, 
    columnType, 
    tableName, 
    values,
    index,
    onIconClick=() => null
}) {
    const naPercent = formatPercent((values["NA"] / sum(Object.values(values)) * 100));
    const uniqueValues = [...Object.keys(values)].length - 1;  // Remove NAs from unique value count
    const chartData = Array.from(
        Object.entries(values), 
        ([value, count]) => ({y: value, x: count})
    );

    chartData.sort((a,b) => descending(a.x, b.x))

    return (
        <Grid 
            container
            spacing={1}
            sx={{
                padding: "10px", 
                minHeight: "300px",
                maxHeight: "90vh",
                maxWidth: "400px"
            }}
        >
            <Grid size={12}>
                <Typography variant="h5" sx={{display: "inline-flex"}}>
                    {name}
                </Typography>
                <IconButton 
                    aria-label="close column details"
                    sx={{ float: "right", padding: 0}}
                    onClick={onIconClick}
                >
                    <ClosePopoverIcon />
                </IconButton>
                <Divider></Divider>                
            </Grid>
            <Grid size={12}>
                <Typography variant="chart title">
                    Unique value count
                </Typography>
                <Box sx={{ 
                    overflowY: "scroll", 
                    maxHeight: "50vh"
                }}>
                    <BarChart data={chartData} />                        
                </Box>
            </Grid>
            <Grid size={4}>
                <dl>
                    <Typography variant="description term">Name</Typography>
                    <Typography variant="description details">{name}</Typography>
                    <Typography variant="description term">Type</Typography>
                    <Typography variant="description details">{columnType}</Typography>
                </dl>
            </Grid>
            <Grid size={4}>
                <dl>
                    <Typography variant="description term">Source Table</Typography>
                    <Typography variant="description details">{tableName}</Typography>
                    <Typography variant="description term">Index</Typography>
                    <Typography variant="description details">{index + 1}</Typography>
                </dl>
            </Grid>
            <Grid size={4}>
                <dl>
                    <Typography variant="description term">Unique values</Typography>
                    <Typography variant="description details">{uniqueValues}</Typography>
                    <Typography variant="description term">NAs</Typography>
                    <Typography variant="description details">{naPercent}%</Typography>
                </dl>
            </Grid>
        </Grid>
    )
}