import { useSelector } from "react-redux";
import { getFocusedOperationId } from "../../data/selectors";
import OperationContainer from "../OperationContainer";

export default function OperationDetail() {
  const focusedOperationId = useSelector(getFocusedOperationId);

  if (focusedOperationId === null) {
    return <div>No focused operations</div>;
  } else {
    return <OperationContainer id={focusedOperationId} layout="Detail" />;
  }
}
