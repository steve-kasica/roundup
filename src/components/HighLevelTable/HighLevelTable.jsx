import { useSelector } from "react-redux";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectFocusedOperationId,
  selectOperation,
} from "../../slices/operationsSlice";
import StackOperationView from "../StackOperationView/StackOperationView";

export const COMPONENT_ID = "FOCUSED_TABLE_VIEW";

export default function HighLevelTable() {
  const focusedOperation = useSelector((state) => {
    const id = selectFocusedOperationId(state);
    return selectOperation(state, id);
  });

  switch (focusedOperation?.operationType) {
    case OPERATION_TYPE_STACK:
      // If the root operation is a stack operation, we don't show the peeked table
      return <StackOperationView id={focusedOperation.id} />;
    // case OPERATION_TYPE_PACK:
    // //   return <PackTable id={focusedOperation.id} />;
    // default:
    //   return <EmptyTable />;
  }
}
