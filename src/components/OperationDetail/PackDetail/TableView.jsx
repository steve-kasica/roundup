import { useState } from "react";
import {
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import withTableData from "../../HOC/withTableData";
import ColumnView from "./ColumnView";
import withColumnVectorData from "../../HOC/withColumnVectorData";
import { descending } from "d3";
import { useSelector } from "react-redux";
import { selectColumnById } from "../../../slices/columnsSlice";

function TableView({ table, columnIds, onChange }) {
  const [selectedColumnId, setSelectedColumnId] = useState(columnIds[0] || "");

  const handleChange = (event) => {
    setSelectedColumnId(event.target.value);
    onChange(event);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        {table.name}
      </Typography>
      <ColumnsList columnIds={columnIds} />
    </>
  );
}

const ColumnsList = ({ columnIds }) => {
  const columns = useSelector((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );
  const sortedColumns = [...columns].sort((a, b) =>
    descending(a.uniqueValues, b.uniqueValues)
  );
  return (
    <List dense>
      {sortedColumns.map((column) => (
        <ColumnView key={column.id} id={column.id} />
      ))}
    </List>
  );
};

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
