import { useState } from "react";
import withTableData from "../../HOC/withTableData";
import { Box, Typography, LinearProgress } from "@mui/material";
import { TableChart as TableIcon } from "@mui/icons-material";
import { ColumnCard } from "../../ColumnViews";
import ColumnHeader from "../../ColumnViews/ColumnHeader";
import ColumnValuesSample from "../../ColumnViews/ColumnValuesSample";

const HighLevelView = ({ table, activeColumnIds }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const loadSummary = async () => {
  //     setLoading(true);
  //     try {
  //       let summaryData = await summarizeTable(table.id, activeColumnIds);
  //       console.log("Raw summary data:", summaryData);
  //       summaryData = summaryData.map((col) => {
  //         const null_percentage = col.null_percentage / 10000;
  //         const null_count = Math.floor(col.count * null_percentage);
  //         return {
  //           ...col,
  //           null_percentage,
  //           null_count,
  //           non_null_count: col.count - null_count,
  //         };
  //       });
  //       setSummary(summaryData);
  //     } catch (error) {
  //       console.error("Error summarizing table:", error);
  //       setSummary(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (table && activeColumnIds.length > 0) {
  //     loadSummary();
  //   } else {
  //     setSummary(null);
  //     setLoading(false);
  //   }
  // }, [table, activeColumnIds]);

  // if (loading) {
  //   return (
  //     <Box sx={{ p: 3 }}>
  //       <Typography variant="h6" gutterBottom>
  //         Loading table summary...
  //       </Typography>
  //       <LinearProgress />
  //     </Box>
  //   );
  // }

  // if (!summary) {
  //   return (
  //     <Box sx={{ p: 3 }}>
  //       <Typography variant="h6" color="text.secondary">
  //         No data available to summarize
  //       </Typography>
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <TableIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          {table.name}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          width: "100%",
          flexWrap: "nowrap",
          justifyContent: "flex-start",
          alignItems: "stretch",
          padding: 1,
          mb: 3,
          gap: 2,
          overflowX: "auto",
        }}
      >
        {activeColumnIds.map((id, index) => (
          <Box sx={{ flex: "0 0 auto" }} key={id}>
            <ColumnCard id={id}>
              <ColumnHeader id={id} />
              <ColumnValuesSample id={id} />
            </ColumnCard>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const EnhancedHighLevelView = withTableData(HighLevelView);
export default EnhancedHighLevelView;
