import { useSelector } from "react-redux";
import StackDetailView from "./StackDetail/StackDetailView";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectFocusedOperationId,
} from "../../slices/operationsSlice";
import PackDetailView from "./PackDetail";
import withOperationData from "../HOC/withOperationData";
import PropTypes from "prop-types";

export default function OperationDetail() {
  const focusedOperationId = useSelector(selectFocusedOperationId);

  if (focusedOperationId === null) {
    return <div>No focused operations</div>;
  } else {
    return <DynamicOperationDetailView id={focusedOperationId} />;
  }
}

const DynamicOperationDetailView = withOperationData(OperationDetailView);

function OperationDetailView(props) {
  switch (props.operationType) {
    case OPERATION_TYPE_STACK:
    case OPERATION_TYPE_NO_OP:
      return <StackDetailView {...props} />;
    case OPERATION_TYPE_PACK:
      return <PackDetailView {...props} />;
    default:
      return <div>Unknown operation type</div>;
  }
}

OperationDetailView.propTypes = {
  operationType: PropTypes.string.isRequired,
};
