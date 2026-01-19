import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  isOperationId,
  JOIN_PREDICATES,
  OPERATION_TYPE_PACK,
  selectOperationsById,
} from "../../../slices/operationsSlice";
import { useSelector } from "react-redux";
import { selectFocusedObjectId } from "../../../slices/uiSlice";
import { withPackOperationData } from "../../HOC";
import { useColumnKeyRankData } from "../../../hooks/useColumnKeyRankData";
import { EnhancedColumnMenuItemContent } from "./ColumnMenuItemContent";

// Fetch the first page automatically
const autoFetch = false;
const pageSize = 5;

const JoinPredicateButton = ({
  // Props passed via withPackOperationData HOC
  leftTableId,
  leftColumnIds = [],
  rightColumnIds = [],
  rightTableId,
  setLeftTableJoinKey,
  setRightTableJoinKey,
  // Props passed from parent component
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [leftTableKeyId, setLeftTableKeyId] = useState(null);
  const [rightTableKeyId, setRightTableKeyId] = useState(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setLeftTableJoinKey(leftTableKeyId);
  }, [leftTableKeyId, setLeftTableJoinKey]);

  useEffect(() => {
    setRightTableJoinKey(rightTableKeyId);
  }, [rightTableKeyId, setRightTableJoinKey]);

  console.log("leftColumnIds:", leftColumnIds, {
    rightsubset: [...rightColumnIds].slice(0, 5),
  });

  const { data, loading, error, hasMore, loadMore, refetch, reset } =
    useColumnKeyRankData(
      leftTableKeyId ? [leftTableKeyId] : [],
      rightTableKeyId ? [rightTableKeyId] : [],
      pageSize,
      autoFetch,
    );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (selectedValue) => {
    const [leftKeyColumnId, rightKeyColumnId] = selectedValue.split("|");
    setLeftTableJoinKey(leftKeyColumnId);
    setRightTableJoinKey(rightKeyColumnId);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        color={leftTableKeyId && rightTableKeyId ? "primary" : "error"}
        disabled={disabled}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ textTransform: "none" }}
      >
        {leftTableKeyId && <Typography>{leftTableKeyId}</Typography>}
        {leftTableKeyId && rightTableKeyId && <Typography> ⟷ </Typography>}
        {rightTableKeyId && <Typography>{rightTableKeyId}</Typography>}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          maxHeight: 400,
          "& .MuiPaper-root": {
            overflow: "hidden",
          },
        }}
      >
        <Box display="flex" flexDirection="row" gap={1} padding={1}>
          <Box
            sx={{
              maxHeight: 300,
              maxWidth: 300,
              overflow: "auto",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
                paddingY: 0.5,
              }}
            >
              Left Table Columns
            </Typography>
            {leftColumnIds.map((leftColId) => (
              <MenuItem
                key={leftColId}
                selected={leftColId === leftTableKeyId}
                onClick={() => setLeftTableKeyId(leftColId)}
              >
                <EnhancedColumnMenuItemContent id={leftColId} />
              </MenuItem>
            ))}
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ maxHeight: 300, maxWidth: 300, overflow: "auto" }}>
            <Typography
              variant="subtitle2"
              sx={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                zIndex: 1,
                paddingY: 0.5,
              }}
            >
              Right Table Columns
            </Typography>
            {rightColumnIds.map((rightColId) => (
              <MenuItem
                key={rightColId}
                selected={rightColId === rightTableKeyId}
                onClick={() => setRightTableKeyId(rightColId)}
              >
                <EnhancedColumnMenuItemContent id={rightColId} />
              </MenuItem>
            ))}
          </Box>
        </Box>

        {/* {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === joinKeysValue}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </MenuItem>
        ))} */}
      </Menu>
    </>
  );
};

const EnhancedJoinPredicateButton = withPackOperationData(JoinPredicateButton);

const FocusedEnhancedJoinPredicateButton = () => {
  const focusedObject = useSelector((state) => {
    const focusedId = selectFocusedObjectId(state);
    if (isOperationId(focusedId)) {
      return selectOperationsById(state, focusedId);
    }
    return null;
  });

  if (!focusedObject || focusedObject.operationType !== OPERATION_TYPE_PACK) {
    return <JoinPredicateButton disabled={true} />;
  } else {
    return <EnhancedJoinPredicateButton id={focusedObject.id} />;
  }
};

export default FocusedEnhancedJoinPredicateButton;
