import { useSelector } from "react-redux";
import StackDetail from "./StackDetail/StackDetail";
import PackDetail from "./PackDetail";
import { getFocusedOperation } from "../../data/selectors";
import { STACK_OPERATION } from "../../data/slices/compositeSchemaSlice";


export default function() {
    const focusedOperation = useSelector(getFocusedOperation);

    if (focusedOperation === null) {
        return <div></div>;
    } else if (focusedOperation.operationType === STACK_OPERATION) {
        return <StackDetail />;
    } else {
        return <PackDetail />;
    }
}