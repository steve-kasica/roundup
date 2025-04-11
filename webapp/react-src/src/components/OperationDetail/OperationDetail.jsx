import { useSelector } from "react-redux";
import StackDetail from "./StackDetail/StackDetail";
import PackDetail from "./PackDetail";
import { getFocusedOperation } from "../../data/selectors";


export default function() {
    const focusedOperation = useSelector(getFocusedOperation);

    if (focusedOperation === null) {
        return <div></div>;
    } else if (focusedOperation.operationType === "STACK") {
        return <StackDetail />;
    } else {
        return <PackDetail />;
    }
}