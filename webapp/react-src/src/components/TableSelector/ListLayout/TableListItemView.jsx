import { DragIndicator } from "@mui/icons-material";
import {
  Chip,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import HighlightText from "../../ui/HighlightText";
import { formatNumber } from "../../../lib/utilities/formaters";

export default function TableListItemView({
  table,
  isDisabled = false,
  searchString = "",
}) {
  const { name, rowCount, columnCount, tags } = table;
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
            <HighlightText pattern={searchString} text={name} />
            <small style={{ paddingLeft: "10px" }}>
              {formatNumber(rowCount)} x {formatNumber(columnCount)}
            </small>
          </Typography>
        }
        secondary={
          <Typography color={isDisabled ? "textDisabled" : "normal"}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Typography>
        }
      />
    </ListItem>
  );
}
