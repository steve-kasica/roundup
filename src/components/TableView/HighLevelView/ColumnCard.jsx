/* eslint-disable react/prop-types */
import withColumnData from "../../ColumnViews/withColumnData";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Typography,
} from "@mui/material";
import {
  formatNumber,
  formatPercentage,
} from "../../../lib/utilities/formaters";
import {
  Remove as NullIcon,
  Numbers as NumberIcon,
  TextFields as TextIcon,
  Event as DateIcon,
  CheckBox as BooleanIcon,
  DataUsage as DataIcon,
} from "@mui/icons-material";

const ColumnCard = ({ column, index, nullCount, completeness }) => {
  const getDataTypeIcon = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (
      lowerType.includes("int") ||
      lowerType.includes("num") ||
      lowerType.includes("float") ||
      lowerType.includes("double")
    ) {
      return <NumberIcon />;
    }
    if (
      lowerType.includes("text") ||
      lowerType.includes("varchar") ||
      lowerType.includes("string")
    ) {
      return <TextIcon />;
    }
    if (lowerType.includes("date") || lowerType.includes("time")) {
      return <DateIcon />;
    }
    if (lowerType.includes("bool")) {
      return <BooleanIcon />;
    }
    return <DataIcon />;
  };
  const getDataTypeColor = (type) => {
    const lowerType = type?.toLowerCase() || "";
    if (
      lowerType.includes("int") ||
      lowerType.includes("num") ||
      lowerType.includes("float") ||
      lowerType.includes("double")
    ) {
      return "primary";
    }
    if (
      lowerType.includes("text") ||
      lowerType.includes("varchar") ||
      lowerType.includes("string")
    ) {
      return "secondary";
    }
    if (lowerType.includes("date") || lowerType.includes("time")) {
      return "success";
    }
    if (lowerType.includes("bool")) {
      return "warning";
    }
    return "default";
  };
  return (
    <Card
      elevation={2}
      sx={{
        flex: "0 0 auto",
        width: "250px",
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ color: "text.secondary", mt: 0.5 }}>
            {getDataTypeIcon(column.columnType)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              noWrap
              title={column.name}
            >
              {column.name || `Column ${index + 1}`}
            </Typography>
            <Chip
              label={column.columnType}
              size="small"
              color={getDataTypeColor(column.columnType)}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Statistics */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Row Count */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Rows
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatNumber(column.count)}
            </Typography>
          </Box>

          {/* Min/Max for numeric columns */}
          {column.max !== null && column.max !== null && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {/* <TrendingDownIcon
                    sx={{ fontSize: 16, color: "success.main" }}
                  /> */}
                  <Typography variant="body2" color="text.secondary">
                    Min
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "120px", // Adjust as needed
                  }}
                >
                  {column.min}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {/* <TrendingUpIcon sx={{ fontSize: 16, color: "error.main" }} /> */}
                  <Typography variant="body2" color="text.secondary">
                    Max
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "120px", // Adjust as needed
                  }}
                  title={column.max} // Shows full value on hover
                >
                  {column.max}
                </Typography>
              </Box>
            </>
          )}

          {/* Null Count */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {/* <NullIcon sx={{ fontSize: 16, color: "warning.main" }} /> */}
              <Typography variant="body2" color="text.secondary">
                Null Values
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="medium">
              {formatNumber(nullCount)}
            </Typography>
          </Box>
        </Box>

        {/* Average Count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* <NullIcon sx={{ fontSize: 16, color: "warning.main" }} /> */}
            <Typography variant="body2" color="text.secondary">
              Average
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(column.avg)}
          </Typography>
        </Box>

        {/* Standard Deviation Count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* <NullIcon sx={{ fontSize: 16, color: "warning.main" }} /> */}
            <Typography variant="body2" color="text.secondary">
              Standard Deviation
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(column.std)}
          </Typography>
        </Box>

        {/* Standard Deviation Count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* <NullIcon sx={{ fontSize: 16, color: "warning.main" }} /> */}
            <Typography variant="body2" color="text.secondary">
              q25
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(column.q25)}
          </Typography>
        </Box>

        {/* Standard Deviation Count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* <NullIcon sx={{ fontSize: 16, color: "warning.main" }} /> */}
            <Typography variant="body2" color="text.secondary">
              q50
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(column.q50)}
          </Typography>
        </Box>

        {/* Standard Deviation Count */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {/* <NullIcon sx={{ fontSize: 16, color: "warning.main" }} /> */}
            <Typography variant="body2" color="text.secondary">
              q75
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight="medium">
            {formatNumber(column.q75)}
          </Typography>
        </Box>

        {/* Data Completeness */}
        <Box sx={{ mt: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Data Completeness
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={
                completeness > 0.9
                  ? "success.main"
                  : column.completeness > 0.7
                  ? "warning.main"
                  : "error.main"
              }
            >
              {formatPercentage(completeness)}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completeness * 100}
            sx={{
              height: 8,
              backgroundColor: "grey.200",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "grey.500",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const EnhancedColumnCard = withColumnData(ColumnCard);

export default EnhancedColumnCard;
