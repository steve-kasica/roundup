import { Typography } from "@mui/material";
import { useColumnValues } from "../../hooks/useColumnValues";
import withColumnData from "./withColumnData";

const ColumnValuesSample = withColumnData(({ column, limit = 3 }) => {
  const { data, loading, error } = useColumnValues(
    column.tableId,
    column.id,
    limit
  );
  if (loading) return <Typography variant="caption">Loading...</Typography>;
  if (error)
    return <Typography variant="caption">Error: {error.message}</Typography>;

  return (
    <Typography
      variant="caption"
      component="div"
      sx={{
        fontSize: "0.7rem",
        fontStyle: "italic",
        fontWeight: 300,
        overflow: "hidden",
        textAlign: "left",
        textOverflow: "ellipsis",
        color: "text.secondary",
        whiteSpace: "nowrap",
        maxWidth: "100%",
        width: "100%",
      }}
    >
      {data.join(", ")}
      {column.count <= limit ? "" : ", ..."}
    </Typography>
  );
});

export default ColumnValuesSample;
