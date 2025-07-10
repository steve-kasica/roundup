import { DragIndicator } from "@mui/icons-material";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import HighlightText from "../../ui/HighlightText";
import { formatNumber } from "../../../lib/utilities/formaters";
import withTableData from "../../HOC/withTableData";

function TableView({ table, isDisabled, searchString }) {
  return (
    <ListItem
      // TODO: add context menu
      // secondaryAction={ <TableDetailsIcon /> }
      disablePadding
    >
      <ListItemIcon>
        <DragIndicator />
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography color={isDisabled ? "textDisabled" : "normal"}>
            <HighlightText pattern={searchString} text={table.name} />
            <small style={{ paddingLeft: "10px" }}>
              {formatNumber(table.rowCount)} x {formatNumber(table.columnCount)}
            </small>
          </Typography>
        }
        // secondary={
        // <Typography color={isDisabled ? "textDisabled" : "normal"}>
        //   {tags.map((tag) => (
        //     <Chip key={tag} label={tag} size="small" />
        //   ))}
        // </Typography>
        // }
      />
    </ListItem>
  );
}

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
