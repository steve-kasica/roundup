import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { ButtonWithMenu } from "../../../ui/buttons";
import {
  selectFocusedObject,
  selectFocusedObjectId,
  selectSelectedTableIds,
} from "../../../../slices/uiSlice";

import {
  AddPackOperationItem,
  AddStackOperationItem,
} from "./AddOperationItem";
import RemoveTablesItem from "./RemoveTablesItem";
import { Divider } from "@mui/material";
import { deleteTablesRequest } from "../../../../sagas/deleteTablesSaga";
import {
  isOperationId,
  selectRootOperation,
  selectRootOperationId,
} from "../../../../slices/operationsSlice";

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

  return (
    <ButtonWithMenu label="Actions" disabled={!isEnabled}>
      <AddStackOperationItem />
      <AddPackOperationItem />
      <Divider orientation="horizontal" />
      <RemoveTablesItem />
    </ButtonWithMenu>
  );
};

export default ActionsButton;
