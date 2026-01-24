import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
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
import { EnhancedColumnName } from "../../ColumnViews";
import JoinPredicateButton from "./JoinPredicateButton";
import { EnhancedTableLabel } from "../../TableView";
import { isTableId } from "../../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../OperationView/OperationLabel";

// Fetch the first page automatically
const autoFetch = false;
const pageSize = 5;

const JoinKeysButton = ({
  // Props passed via withPackOperationData HOC
  id,
  leftTableId,
  leftColumnIds = [],
  rightColumnIds = [],
  rightTableId,
  leftKey,
  rightKey,
  setJoinPredicate,
  joinPredicate,
  setLeftTableJoinKey,
  setRightTableJoinKey,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [leftTableKeyId, setLeftTableKeyId] = useState(leftKey);
  const [rightTableKeyId, setRightTableKeyId] = useState(rightKey);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (setLeftTableJoinKey && leftTableKeyId) {
      setLeftTableJoinKey(leftTableKeyId);
    }
  }, [leftTableKeyId, setLeftTableJoinKey]);

  useEffect(() => {
    if (setRightTableJoinKey && rightTableKeyId) {
      setRightTableJoinKey(rightTableKeyId);
    }
  }, [rightTableKeyId, setRightTableJoinKey]);

  // const { data, loading, error, hasMore, loadMore, refetch, reset } =
  //   useColumnKeyRankData(
  //     leftTableKeyId ? [leftTableKeyId] : [],
  //     rightTableKeyId ? [rightTableKeyId] : [],
  //     pageSize,
  //     autoFetch,
  //   );

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        disabled={!id}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ textTransform: "none" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {!leftTableKeyId && !rightTableKeyId ? (
            <Typography>Pack parameters</Typography>
          ) : (
            <>
              {leftTableKeyId ? (
                <EnhancedColumnName id={leftTableKeyId} />
              ) : (
                <Typography sx={{ fontStyle: "italic", color: "gray" }}>
                  ???
                </Typography>
              )}
              {joinPredicate && (
                <Typography component="span">
                  {JOIN_PREDICATES[joinPredicate].toLowerCase()}
                </Typography>
              )}
              {rightTableKeyId ? (
                <EnhancedColumnName id={rightTableKeyId} />
              ) : (
                <Typography sx={{ fontStyle: "italic", color: "gray" }}>
                  ???
                </Typography>
              )}
            </>
          )}
        </Stack>
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
          horizontal: "right",
        }}
        sx={{
          maxHeight: 400,
          maxWidth: 500,
          "& .MuiPaper-root": {
            overflow: "hidden",
          },
        }}
      >
        <Box display={"flex"} flexDirection={"column"}>
          <Box
            display="flex"
            justifyContent={"center"}
            alignContent={"center"}
            position="relative"
            sx={{
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1,
            }}
          >
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            {leftTableKeyId ? (
              <EnhancedColumnName
                id={leftTableKeyId}
                containerSx={{
                  alignContent: "center",
                  justifyContent: "center",
                  pr: 1,
                }}
              />
            ) : null}
            <JoinPredicateButton
              id={id}
              joinPredicate={joinPredicate}
              setJoinPredicate={setJoinPredicate}
            />
            {rightTableKeyId ? (
              <EnhancedColumnName
                id={rightTableKeyId}
                containerSx={{
                  alignContent: "center",
                  justifyContent: "center",
                  pl: 1,
                }}
              />
            ) : null}
          </Box>
          <Box display="flex" justifyContent={"center"} width={"100%"}>
            <Box width={"45%"}>
              <Typography
                variant="subtitle2"
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {isTableId(leftTableId) ? (
                  <EnhancedTableLabel id={leftTableId} />
                ) : (
                  <EnhancedOperationLabel id={leftTableId} />
                )}
              </Typography>
              <MenuList sx={{ p: 0, maxHeight: 300, overflowY: "auto" }}>
                {leftColumnIds.map((leftColId) => (
                  <MenuItem
                    key={leftColId}
                    selected={leftColId === leftTableKeyId}
                    onClick={() => setLeftTableKeyId(leftColId)}
                  >
                    <EnhancedColumnMenuItemContent id={leftColId} />
                  </MenuItem>
                ))}
              </MenuList>
            </Box>
            <Box
              width="10%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Divider orientation="vertical" flexItem sx={{ height: 300 }} />
            </Box>
            <Box width={"45%"}>
              <Typography
                variant="subtitle2"
                sx={{
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {isTableId(rightTableId) ? (
                  <EnhancedTableLabel id={rightTableId} />
                ) : (
                  <EnhancedOperationLabel id={rightTableId} />
                )}
              </Typography>
              <MenuList sx={{ p: 0, maxHeight: 300, overflowY: "auto" }}>
                {rightColumnIds.map((rightColId) => (
                  <MenuItem
                    key={rightColId}
                    selected={rightColId === rightTableKeyId}
                    onClick={() => setRightTableKeyId(rightColId)}
                  >
                    <EnhancedColumnMenuItemContent id={rightColId} />
                  </MenuItem>
                ))}
              </MenuList>
            </Box>
          </Box>
        </Box>
      </Menu>
    </>
  );
};

const EnhancedJoinKeysButton = withPackOperationData(JoinKeysButton);

const FocusedEnhancedJoinKeysButton = () => {
  const focusedPackOperationId = useSelector((state) => {
    const focusedId = selectFocusedObjectId(state);
    if (isOperationId(focusedId)) {
      const op = selectOperationsById(state, focusedId);
      if (op?.operationType === OPERATION_TYPE_PACK) {
        return op.id;
      }
    }
    return null;
  });

  if (focusedPackOperationId) {
    return <EnhancedJoinKeysButton id={focusedPackOperationId} />;
  } else {
    return <JoinKeysButton />;
  }
};

export default FocusedEnhancedJoinKeysButton;
