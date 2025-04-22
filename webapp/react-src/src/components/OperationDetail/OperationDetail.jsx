import { useSelector } from "react-redux";
import { getFocusedOperationId } from "../../data/selectors";
import StackDetailView from "./StackDetail/StackDetailView";

export default function OperationDetail() {
  const focusedOperationId = useSelector(getFocusedOperationId);

  if (focusedOperationId === null) {
    return <div>No focused operations</div>;
  } else {
    return <StackDetailView id={focusedOperationId} />;
  }
}
