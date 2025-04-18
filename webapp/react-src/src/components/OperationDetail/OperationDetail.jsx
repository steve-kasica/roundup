import { useSelector } from "react-redux";
import StackDetail from "./StackDetail/StackDetail";
import PackDetail from "./PackDetail";
import { getFocusedOperation } from "../../data/selectors.js";
import { OPERATION_TYPE_STACK } from "../../data/slices/operationsSlice";


export default function() {
    const focusedOperation = useSelector(getFocusedOperation);

    if (focusedOperation === null) {
        return <div></div>;
    } else if (focusedOperation.operationType === OPERATION_TYPE_STACK) {
        return <StackDetail />;
    } else {
        return <PackDetail />;
    }
}