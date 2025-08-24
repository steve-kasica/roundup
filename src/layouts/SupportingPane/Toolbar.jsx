import React from "react";
import {
  Toolbar,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import FilterListIcon from "@mui/icons-material/FilterList";
import ExportCompositeTable from "../../components/ExportCompositeTable";
import { GetApp as ExportIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { LOD, setDialogContent, setLevelOfDetail } from "../../slices/uiSlice";
import { MODULE_NAME as EXPORT_MODULE } from "../../components/ExportCompositeTable";
import { selectAllOperationIds } from "../../slices/operationsSlice";

export default function AppToolbar() {
  const dispatch = useDispatch();

  const operationCount = useSelector(
    (state) => selectAllOperationIds(state).length
  );

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
      <ToggleButtonGroup
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
      </ToggleButtonGroup>
      <ToggleButtonGroup
        value={view}
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
