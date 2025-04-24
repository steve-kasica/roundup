import { useSelector } from "react-redux";
import StackDetailView from "./StackDetail/StackDetailView";
import { selectSelectedOperationId } from "../../data/slices/uiSlice";

export default function OperationDetail() {
  const focusedOperationId = useSelector(selectSelectedOperationId);

  if (focusedOperationId === null) {
    return <div>No focused operations</div>;
  } else {
    return <StackDetailView id={focusedOperationId} />;
  }
}
