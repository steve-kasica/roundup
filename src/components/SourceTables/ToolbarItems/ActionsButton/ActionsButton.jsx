import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { ButtonWithMenu } from "../../../ui/buttons";
import {
  clearSelectedTableIds,
  selectFocusedObject,
  selectSelectedTableIds,
} from "../../../../slices/uiSlice";

import { Divider } from "@mui/material";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectRootOperationId,
} from "../../../../slices/operationsSlice";
import { createOperationsRequest } from "../../../../sagas/createOperationsSaga/actions";
import { updateOperationsRequest } from "../../../../sagas/updateOperationsSaga";
import PackMenuItem from "./PackMenuItem";
import StackMenuItem from "./StackMenuItem";
import AppendMenuItem from "./AppendMenuItem";

const ActionsButton = () => {
  const dispatch = useDispatch();

  const selectedTableIds = useSelector(selectSelectedTableIds);
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
      <PackMenuItem
        onClick={handleOnPackClick}
        selectedCount={selectedTableIds.length}
      />
      <StackMenuItem
        onClick={handleOnStackClick}
        selectedCount={selectedTableIds.length}
      />
      <Divider orientation="horizontal" />
      <AppendMenuItem
        onClick={handleInsertClick}
        selectedCount={selectedTableIds.length}
      />
    </ButtonWithMenu>
  );
};

export default ActionsButton;
