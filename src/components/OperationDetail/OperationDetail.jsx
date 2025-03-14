import { useSelector } from "react-redux";
import { isStackOperation } from "../../lib/types/Operation";
import StackDetail from "./StackDetail";
import PackDetail from "./PackDetail";


export default function() {
    const {selectedOperation} = useSelector(({ui}) => ui);
    if (isStackOperation(selectedOperation)) {
        return <StackDetail />
    } else {
        return <PackDetail />
    }
}