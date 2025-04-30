import { useSelector } from "react-redux";
import StackDetailView from "./StackDetail/StackDetailView";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectFocusedOperationId,
} from "../../data/slices/operationsSlice";
import { OperationContainer } from "../Containers";
import PackDetailView from "./PackDetailView";

export default function OperationDetail() {
  const focusedOperationId = useSelector(selectFocusedOperationId);

  if (focusedOperationId === null) {
    return <div>No focused operations</div>;
  } else {
    return (
      <OperationContainer id={focusedOperationId}>
        <DynamicDetailView />
      </OperationContainer>
    );
  }
}

function DynamicDetailView({ operation, columnCount }) {
  const { operationType, id } = operation;

  switch (operationType) {
    case OPERATION_TYPE_STACK:
    case OPERATION_TYPE_NO_OP:
      return <StackDetailView operationId={id} columnCount={columnCount} />;
    case OPERATION_TYPE_PACK:
      return <PackDetailView operationId={id} columnCount={columnCount} />;
    default:
      return <div>Unknown operation type</div>;
  }
}
