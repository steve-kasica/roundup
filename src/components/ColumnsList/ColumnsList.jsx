import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import { ArrowDownAZ, ArrowUpZA, ArrowUpDown } from "lucide-react";
import { ascending, descending } from "d3";

import { selectAllColumnIds } from "../../slices/columnsSlice/selectors";
import { selectColumnsById } from "../../slices/columnsSlice";
import { COLUMN_TYPE_CATEGORICAL } from "../../slices/columnsSlice/Column";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";
import { SearchTextBox } from "../ui/input";
import HighlightText from "../ui/HighlightText";
import { ButtonWithMenu } from "../ui/buttons";
import {
  selectSelectedColumnIds,
  setSelectedColumnIds,
  removeFromSelectedColumnIds,
  setHoveredColumnIds,
  setFocusedColumnIds,
} from "../../slices/uiSlice";
import SummarizeItem from "./SummarizeItem";
import CompareItem from "./CompareItem";
import DeleteItem from "./DeleteItem";
import SelectAllItem from "./SelectAllItem";
import DeselectAllItem from "./DeselectAllItem";
import ColumnProperties from "./ColumnProperties.jsx";
import { COLUMN_PROPERTIES, DEFAULT_VISIBLE } from "./columnProperties.js";

// eslint-disable-next-line no-unused-vars
function SortIcon({ attr, isSort, attrType, isAscending }) {
  const iconProps = { strokeWidth: 1, size: 18 };

  const [AscIcon, DescIcon] = [ArrowDownAZ, ArrowUpZA];

  return isSort ? (
    isAscending ? (
      <AscIcon {...iconProps} />
    ) : (
      <DescIcon {...iconProps} />
    )
  ) : (
    <ArrowUpDown {...iconProps} />
  );
}

const ColumnsList = () => {
  const dispatch = useDispatch();
  const [sortAttribute, setSortAttribute] = useState(null);
  const [isAscending, setIsAscending] = useState(true);
  const [searchString, setSearchString] = useState("");
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [visibleProperties, setVisibleProperties] = useState(DEFAULT_VISIBLE);

  const headers = useMemo(
    () =>
      COLUMN_PROPERTIES.filter((p) => visibleProperties.has(p.key)).map(
        (p) => ({
          attr: p.key,
          label: p.label,
          tooltip: `Sort by ${p.label.toLowerCase()}`,
          attrType: COLUMN_TYPE_CATEGORICAL,
        }),
      ),
    [visibleProperties],
  );

  const selectedColumnIds = useSelector(selectSelectedColumnIds);

  const allColumnIds = useSelector(selectAllColumnIds);
  const allColumns = useSelector((state) =>
    selectColumnsById(state, allColumnIds),
  );
  const tablesById = useSelector((state) => state.tables.byId);
  const operationsById = useSelector((state) => state.operations.byId);

  // Enrich columns with resolved parent name
  const enrichedColumns = useMemo(() => {
    if (!allColumns) return [];
    return allColumns.filter(Boolean).map((col) => {
      let parentName = "—";
      if (col.parentId) {
        if (isTableId(col.parentId)) {
          const table = selectTablesById(
            { tables: { byId: tablesById } },
            col.parentId,
          );
          parentName = table?.name ?? "—";
        } else {
          const op = selectOperationsById(
            { operations: { byId: operationsById } },
            col.parentId,
          );
          parentName = op?.name ?? "—";
        }
      }
      return {
        ...col,
        parentName,
        duplicateCount:
          col.count != null && col.approxUnique != null
            ? col.count - col.approxUnique
            : null,
        uniquePercentage:
          col.approxUnique != null && col.count
            ? col.approxUnique / col.count
            : null,
        nullCount:
          col.count != null && col.nullPercentage != null
            ? Math.floor(col.count * col.nullPercentage)
            : null,
        completePercentage:
          col.nullPercentage != null ? 1 - col.nullPercentage : null,
        nonNullCount:
          col.count != null && col.nullPercentage != null
            ? Math.floor(col.count * (1 - col.nullPercentage))
            : null,
        modeValue: col.topValues?.[0]?.value ?? null,
        modeCount: col.topValues?.[0]?.count ?? null,
      };
    });
  }, [allColumns, tablesById, operationsById]);

  const sortedColumns = useMemo(
    () =>
      enrichedColumns.toSorted((a, b) =>
        isAscending
          ? ascending(a[sortAttribute], b[sortAttribute])
          : descending(a[sortAttribute], b[sortAttribute]),
      ),
    [enrichedColumns, sortAttribute, isAscending],
  );

  const handleSearchChange = (value) => {
    setSearchString(value.trim().toLowerCase());
  };

  const handleRowClick = useCallback(
    (event, id) => {
      const currentIndex = sortedColumns.map(({ id }) => id).indexOf(id);
      const isCurrentlySelected = selectedColumnIds.includes(id);

      // Cmd/Ctrl + click: Toggle individual selection, preserve others
      if (event.ctrlKey || event.metaKey) {
        if (isCurrentlySelected) {
          dispatch(removeFromSelectedColumnIds(id));
        } else {
          dispatch(setSelectedColumnIds([...selectedColumnIds, id]));
        }
        setLastClickedIndex(currentIndex);
      }
      // Shift + click: Select contiguous range from anchor to current
      else if (event.shiftKey && lastClickedIndex !== null) {
        const start = Math.min(lastClickedIndex, currentIndex);
        const end = Math.max(lastClickedIndex, currentIndex);
        const rangeIds = sortedColumns
          .map(({ id }) => id)
          .slice(start, end + 1);
        dispatch(setSelectedColumnIds(rangeIds));
      }
      // Simple click: Clear selection if already selected, otherwise select only this item
      else {
        if (isCurrentlySelected) {
          dispatch(setSelectedColumnIds([]));
          setLastClickedIndex(null);
        } else {
          dispatch(setSelectedColumnIds([id]));
          setLastClickedIndex(currentIndex);
        }
      }
    },
    [dispatch, lastClickedIndex, selectedColumnIds, sortedColumns],
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box display="flex" alignItems="center" gap={1} padding={1}>
        <SearchTextBox
          placeholder="Search columns..."
          onChange={handleSearchChange}
        />
        <ColumnProperties
          visibleProperties={visibleProperties}
          onVisiblePropertiesChange={setVisibleProperties}
        />
        <ButtonWithMenu label="Actions">
          <SelectAllItem />
          <DeselectAllItem />
          <Divider />
          <SummarizeItem />
          <CompareItem />
          <Divider />
          <DeleteItem />
        </ButtonWithMenu>
      </Box>

      <TableContainer
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          width: "100%",
          containerType: "inline-size",
          containerName: "columnsLayout",
          backgroundColor: (theme) => theme.palette.background.paper,
          border: "1px solid rgba(0, 0, 0, 0.12)",
        }}
      >
        <Table
          size="small"
          style={{
            width: "100%",
            height: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          }}
        >
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: (theme) => theme.palette.background.paper,
            }}
          >
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header.attr}
                  sx={{
                    padding: 0,
                    borderRight: "1px solid rgba(0, 0, 0, 0.12)",
                  }}
                >
                  <Button
                    color="inherit"
                    disableRipple
                    fullWidth
                    onClick={() => {
                      if (header.attr === sortAttribute) {
                        setIsAscending(!isAscending);
                      } else {
                        setSortAttribute(header.attr);
                      }
                    }}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="label">{header.label}</Typography>
                    &nbsp;
                    <SortIcon
                      attr={header.attr}
                      isSort={header.attr === sortAttribute}
                      attrType={header.attrType}
                      isAscending={isAscending}
                    />
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedColumns.map((col) => {
              const hasNameMatch =
                !searchString ||
                (col.name && col.name.toLowerCase().includes(searchString));
              const isDisabled = searchString.length > 0 && !hasNameMatch;
              const isSelected = selectedColumnIds.includes(col.id);

              return (
                <TableRow
                  key={col.id}
                  hover={!isDisabled}
                  selected={isSelected}
                  onClick={(event) =>
                    !isDisabled && handleRowClick(event, col.id)
                  }
                  onDoubleClick={() =>
                    !isDisabled && dispatch(setFocusedColumnIds([col.id]))
                  }
                  onMouseEnter={() => dispatch(setHoveredColumnIds([col.id]))}
                  onMouseLeave={() => dispatch(setHoveredColumnIds([]))}
                  sx={{
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    userSelect: "none",
                    height: "1px",
                    ...(isDisabled && {
                      opacity: (theme) => theme.palette.action.disabledOpacity,
                    }),
                  }}
                >
                  {headers.map((header) => (
                    <TableCell key={header.attr} sx={{ whiteSpace: "nowrap" }}>
                      {header.attr === "name" && searchString && col.name ? (
                        <HighlightText
                          pattern={searchString}
                          text={col.name}
                          matchSx={{ backgroundColor: "yellow" }}
                        />
                      ) : (
                        (col[header.attr] ?? "—")
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ColumnsList;
