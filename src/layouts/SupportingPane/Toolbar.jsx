import React from "react";
import {
  Toolbar,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  GetApp as ExportIcon,
  Compare as CompareColumnsIcon,
  Delete as DeleteColumnsIcon,
  Clear as ClearSelectionIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  LOD,
  setDialogContent,
  setDrawerContents,
  setLevelOfDetail,
} from "../../slices/uiSlice";
import { MODULE_NAME as EXPORT_MODULE } from "../../components/ExportCompositeTable";
import { selectAllOperationIds } from "../../slices/operationsSlice";
import {
  clearSelectedColumns,
  selectSelectedColumns,
} from "../../slices/columnsSlice";
import { removeColumnsRequest } from "../../sagas/removeColumnsSaga";
import { ID as COLUMN_INDEX_DETAILS_COMPONENT } from "../../components/ColumnIndexDetails";

export default function AppToolbar() {
  const dispatch = useDispatch();

  const operationCount = useSelector(
    (state) => selectAllOperationIds(state).length
  );

  const lod = useSelector((state) => state.ui.levelOfDetail);
  const selectedColumnIds = useSelector(selectSelectedColumns);

  const [formats, setFormats] = React.useState([]);
  const [view, setView] = React.useState("list");

  const handleFormat = (event, newFormats) => {
    setFormats(newFormats);
  };

  const handleView = (event, newView) => {
    if (newView !== null) setView(newView);
  };

  return (
    <Toolbar>
      {/* <ToggleButtonGroup
        value={formats}
        onChange={handleFormat}
        aria-label="text formatting"
        size="small"
      >
        <ToggleButton value="bold" aria-label="bold">
          <FormatBoldIcon />
        </ToggleButton>
        <ToggleButton value="italic" aria-label="italic">
          <FormatItalicIcon />
        </ToggleButton>
        <ToggleButton value="underlined" aria-label="underlined">
          <FormatUnderlinedIcon />
        </ToggleButton>
      </ToggleButtonGroup> */}
      <Tooltip title="Compare selected columns" arrow>
        <span>
          <IconButton
            disabled={selectedColumnIds.length < 2}
            onClick={() =>
              dispatch(setDrawerContents(COLUMN_INDEX_DETAILS_COMPONENT))
            }
          >
            <CompareColumnsIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Remove selected columns" arrow>
        <span>
          <IconButton
            disabled={selectedColumnIds.length === 0}
            onClick={() => dispatch(removeColumnsRequest(selectedColumnIds))}
          >
            <DeleteColumnsIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Clear selection" arrow>
        <span>
          <IconButton
            disabled={selectedColumnIds.length === 0}
            onClick={() => {
              // setSelectionAnchorCell(null);
              // setSelectionExtentCell(null);
              dispatch(clearSelectedColumns());
              // dispatch(setShowColumnIndexDetails(false));
            }}
          >
            <ClearSelectionIcon />
          </IconButton>
        </span>
      </Tooltip>

      <ToggleButtonGroup
        value={lod}
        exclusive
        onChange={(event, lod) => dispatch(setLevelOfDetail(lod))}
        aria-label="view mode"
        size="small"
        sx={{ ml: 2 }}
      >
        <ToggleButton value={LOD.LOW} aria-label="low view">
          Low
        </ToggleButton>
        <ToggleButton value={LOD.HIGH} aria-label="high view">
          High
        </ToggleButton>
      </ToggleButtonGroup>
      <Tooltip title="Download the composite table as a file" arrow>
        <span>
          <IconButton
            aria-label="export composite schema"
            sx={{ ml: 2 }}
            // TODO: also disable if there's error on this operations
            disabled={operationCount === 0}
            onClick={() => dispatch(setDialogContent(EXPORT_MODULE))}
          >
            <ExportIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Toolbar>
  );
}
