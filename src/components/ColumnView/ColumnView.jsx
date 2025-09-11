import EditableText from "../ui/EditableText";
import withColumnData from "./withColumnData";
import ColumnTypeIcon from "./ColumnTypeIcon";
import { useRef, useState } from "react";
import {
  Box,
  Card,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Collapse,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import StyledPaper from "./StyledPaper";
import {
  DriveFileRenameOutline as RenameIcon,
  DeleteForever as RemoveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BarChart as BarChartIcon,
  List as ListIcon,
  Straighten as StraightenIcon,
  MoreVert,
  Settings as SettingsIcon,
  ArrowRight as ArrowRightIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { formatNumber, formatPercentage } from "../../lib/utilities/formaters";
import BarChart from "../visualization/BarChart";

const ColumnView = withColumnData(
  ({
    column,
    uniqueCount,
    nullCount,
    mode,
    completeCount,
    duplicateCount,
    isHovered,
    isSelected,
    hoverColumn,
    unhoverColumn,
    selectSingleColumn,
    unselectColumn,
    removeColumn,
    lod = 1,
    sampleLimit = 3,
  }) => {
    const headerInputRef = useRef(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [lodSubmenuAnchorEl, setLodSubmenuAnchorEl] = useState(null);
    const [isHeaderEditable, setIsHeaderEditable] = useState(false);
    const [isStatsExpanded, setIsStatsExpanded] = useState(true);
    const [isValuesExpanded, setIsValuesExpanded] = useState(true);
    const [valuesMode, setValuesMode] = useState("counts"); // 'counts', 'raw', 'length'

    const valueSample = Object.keys(column.values);

    // Generate data based on mode
    const getValuesData = () => {
      switch (valuesMode) {
        case "counts":
          return column.values;
        case "raw":
          // Show unique values without counts
          return Object.keys(column.values).reduce((acc, key) => {
            acc[key] = 1;
            return acc;
          }, {});
        case "length":
          // Group by string length
          return Object.keys(column.values).reduce((acc, key) => {
            const length = String(key).length;
            const lengthKey = `${length} char${length !== 1 ? "s" : ""}`;
            acc[lengthKey] = (acc[lengthKey] || 0) + column.values[key];
            return acc;
          }, {});
        default:
          return column.values;
      }
    };

    const getXAxisLabel = () => {
      switch (valuesMode) {
        case "counts":
          return "count →";
        case "length":
          return "length →";
        default:
          return "count →";
      }
    };

    const handleValuesMode = (event, newMode) => {
      if (newMode !== null) {
        setValuesMode(newMode);
      }
    };

    const menuItems = [
      {
        label: "Rename",
        icon: RenameIcon,
        action: () => setIsHeaderEditable(true),
      },
      {
        label: "Remove",
        icon: RemoveIcon,
        action: removeColumn,
      },
    ];

    return (
      <>
        <StyledPaper
          elevation={1}
          isHovered={isHovered}
          isSelected={isSelected}
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 1,
            cursor: "pointer",
            width: 200,
            userSelect: "none",
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setMenuAnchorEl(e.currentTarget);
          }}
          onClick={() => {
            if (!isSelected) selectSingleColumn();
            else unselectColumn();
          }}
          onMouseEnter={hoverColumn}
          onMouseLeave={unhoverColumn}
        >
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            sx={{ gap: 0 }}
          >
            <Box
              backgroundColor="#ddd"
              borderRadius="25%"
              padding="1px 3px"
              height="25px"
              width="25px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              marginRight={1}
            >
              <ColumnTypeIcon column={column} placement="top" />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="left"
              justifyContent="center"
              padding={1}
              overflow="hidden"
            >
              <EditableText
                inputRef={headerInputRef}
                initialValue={column.name}
                placeholder={`Column ${column.index + 1}`}
                onChange={column.onChangeHandler}
                isReadOnly={true}
                isEditable={isHeaderEditable}
                onEditingStateChange={() => console.log(arguments)}
                fontSize="1rem"
              />
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
                {valueSample.slice(0, sampleLimit).join(", ")}
                {valueSample.length <= sampleLimit ? "" : ", ..."}
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{ p: 0, ml: "auto" }}
              onClick={(event) => {
                event.stopPropagation();
                setMenuAnchorEl(event.currentTarget);
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {lod > 1 && (
            <>
              <Divider sx={{ my: 1 }} />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" sx={{ mb: 0 }}>
                  Stats
                </Typography>
                <IconButton
                  size="small"
                  sx={{ p: 0 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsStatsExpanded(!isStatsExpanded);
                  }}
                >
                  {isStatsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={isStatsExpanded}>
                <Box sx={{ mt: 1 }}>
                  {/* <ColumnStats
                    data={{
                      null: nullCount,
                      completeness:
                        ((completeCount - nullCount) / completeCount) * 100 +
                        "%",
                      unique: uniqueCount,
                      duplicate: duplicateCount,
                      top: `${mode} (${column.values[mode] || 0})`,
                    }}
                  /> */}
                </Box>
              </Collapse>
            </>
          )}

          {lod > 2 && (
            <>
              <Divider />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" sx={{ mb: 0 }}>
                  Values
                </Typography>
                <IconButton
                  size="small"
                  sx={{ p: 0 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsValuesExpanded(!isValuesExpanded);
                  }}
                >
                  {isValuesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={isValuesExpanded}>
                <Box sx={{ mt: 1 }}>
                  {/* Segmented Button for mode selection */}
                  <Box display={"flex"} justifyContent="flex-end" mb={1}>
                    <ToggleButtonGroup
                      value={valuesMode}
                      exclusive
                      onChange={handleValuesMode}
                      aria-label="values display mode"
                      size="small"
                      sx={{
                        width: "75px",
                        "& .MuiToggleButton-root": {
                          flex: 1,
                          fontSize: "0.75rem",
                          padding: "4px 8px",
                          "&.Mui-selected": {
                            backgroundColor: "#3b82f6",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "#2563eb",
                            },
                          },
                        },
                      }}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <ToggleButton value="counts" aria-label="value counts">
                        <BarChartIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      </ToggleButton>
                      <ToggleButton value="length" aria-label="string length">
                        <StraightenIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <BarChart
                    data={getValuesData()}
                    xAxisLabel={getXAxisLabel()}
                    marginLeft={10}
                    marginRight={10}
                    marginTop={10}
                    marginBottom={10}
                    color="#3b82f6"
                    minHeight={200}
                    formatValue={formatNumber}
                  />
                </Box>
              </Collapse>
            </>
          )}
        </StyledPaper>

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => {
                setMenuAnchorEl(null);
                item.action();
              }}
            >
              <ListItemIcon>
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
);

export default ColumnView;
