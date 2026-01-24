import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { ButtonWithMenu } from "../../ui/buttons";
import { selectSelectedTableIds } from "../../../slices/uiSlice";

import {
  AddPackOperationItem,
  AddStackOperationItem,
} from "./AddOperationItem";
import DeleteTablesItem from "./DeleteTablesItem";
import RemoveTablesItem from "./RemoveTablesItem";
import { Divider } from "@mui/material";
import { deleteTablesRequest } from "../../../sagas/deleteTablesSaga";

const ActionsButton = () => {
  const dispatch = useDispatch();

  const selectedTableIds = useSelector(selectSelectedTableIds);
  const isDisabled = useMemo(
    () => selectedTableIds.length === 0,
    [selectedTableIds],
  );

  const handleOnDeleteTables = useCallback(() => {
    dispatch(deleteTablesRequest(selectedTableIds));
  }, [dispatch, selectedTableIds]);

  return (
    <ButtonWithMenu label="Actions" disabled={isDisabled}>
      <AddStackOperationItem />
      <AddPackOperationItem />
      <Divider orientation="horizontal" />
      <DeleteTablesItem onConfirm={handleOnDeleteTables} />
      <RemoveTablesItem />
    </ButtonWithMenu>
  );
};

export default ActionsButton;
