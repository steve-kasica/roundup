import { useSelector } from "react-redux";
import { isStackOperation } from "../../lib/types/Operation";
import StackDetail from "./StackDetail/StackDetail";
import PackDetail from "./PackDetail";


export default function() {
    const {selectedOperation} = useSelector(({ui}) => ui);

    if (selectedOperation === null) {
        return <div></div>;
    } else if (isStackOperation(selectedOperation)) {
        return <StackDetail />;
    } else {
        return <PackDetail />;
    }
}