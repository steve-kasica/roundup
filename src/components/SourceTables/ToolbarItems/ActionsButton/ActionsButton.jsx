import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { ButtonWithMenu } from "../../../ui/buttons";
import {
  clearSelectedTableIds,
  selectFocusedObject,
  selectSelectedTableIds,
} from "../../../../slices/uiSlice";

import { Divider, ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectRootOperationId,
} from "../../../../slices/operationsSlice";
import { PackOperationIcon, StackOperationIcon } from "../../../ui/icons";
import { createOperationsRequest } from "../../../../sagas/createOperationsSaga/actions";
import { updateOperationsRequest } from "../../../../sagas/updateOperationsSaga";

const ActionsButton = () => {
  const dispatch = useDispatch();

  const selectedTableIds = useSelector(selectSelectedTableIds);
  // const focusedObjectId = useSelector(selectFocusedObjectId);
  const rootOperationId = useSelector(selectRootOperationId);
  const focusedObject = useSelector(selectFocusedObject);

  const isEnabled = useMemo(
    () => {
      const isCompleteOperation =
        isOperationId(focusedObject?.id) &&
        focusedObject?.isMaterialized &&
        focusedObject?.isInSync;
      const appIsInInitialState = rootOperationId === null;
      return (
        selectedTableIds.length > 0 &&
        (isCompleteOperation || appIsInInitialState)
      );
    },
    [
      rootOperationId,
      selectedTableIds.length,
      focusedObject?.id,
      focusedObject?.isMaterialized,
      focusedObject?.isInSync,
    ], // no selected tables
  );

  const handleOnPackClick = useCallback(() => {
    dispatch(
      createOperationsRequest([
        {
          operationType: OPERATION_TYPE_PACK,
          childIds: (rootOperationId ? [rootOperationId] : []).concat(
            selectedTableIds,
          ),
        },
      ]),
    );
    dispatch(clearSelectedTableIds());
  }, [dispatch, rootOperationId, selectedTableIds]);

  const handleOnStackClick = useCallback(() => {
    dispatch(
      createOperationsRequest([
        {
          operationType: OPERATION_TYPE_STACK,
          childIds: (rootOperationId ? [rootOperationId] : []).concat(
            selectedTableIds,
          ),
        },
      ]),
    );
    dispatch(clearSelectedTableIds());
  }, [dispatch, rootOperationId, selectedTableIds]);

  const handleInsertClick = useCallback(() => {
    dispatch(
      updateOperationsRequest([
        {
          id: focusedObject.id,
          childIds: focusedObject.childIds.concat(selectedTableIds),
        },
      ]),
    );
    dispatch(clearSelectedTableIds());
  }, [dispatch, focusedObject?.childIds, focusedObject?.id, selectedTableIds]);

  return (
    <ButtonWithMenu label="Actions" disabled={!isEnabled}>
      <MenuItem onClick={handleOnPackClick}>
        <ListItemIcon>
          <PackOperationIcon />
        </ListItemIcon>
        <ListItemText>Pack tables</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleOnStackClick}>
        <ListItemIcon>
          <StackOperationIcon />
        </ListItemIcon>
        <ListItemText>Stack tables</ListItemText>
      </MenuItem>
      <Divider orientation="horizontal" />
      <MenuItem onClick={handleInsertClick}>
        <ListItemIcon>
          <StackOperationIcon />
        </ListItemIcon>
        <ListItemText>Append tables</ListItemText>
      </MenuItem>
    </ButtonWithMenu>
  );
};

export default ActionsButton;
