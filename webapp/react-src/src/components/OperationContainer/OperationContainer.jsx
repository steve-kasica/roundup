import { useDispatch, useSelector } from 'react-redux';
import { getFocusedOperationId, getHoverOperationId, getOperationById } from '../../data/selectors';
import { unhoverOperation, hoverOperation, focusOperation } from '../../data/uiSlice';

// view layouts
import OperationBlockView from './OperationBlockView';
import OperationListItemView from './OperationListItemView';

export const OPERATION_LAYOUT_BLOCK = 'block';
export const OPERATION_LAYOUT_LIST_ITEM = 'list-item';

export default function OperationContainer({ id, layout }) {
    const dispatch = useDispatch();
    const operation = useSelector(state => getOperationById(state, id));
    const focusedOperationId = useSelector(getFocusedOperationId);
    const hoverOperationId = useSelector(getHoverOperationId);

    let OperationView;
    switch(layout) {
        case OPERATION_LAYOUT_BLOCK:
            OperationView = OperationBlockView;
            break;
        case OPERATION_LAYOUT_LIST_ITEM:
            OperationView = OperationListItemView;
            break;
        default:
            OperationView = OperationBlockView;
            break;
    }

    const isFocused = operation.id === focusedOperationId;
    // const isHover = operation.id === hoverOperationId;
    const isHover = false; // TODO: implement hover state
    const className = [
        "OperationView",
        operation.operationType,
        `depth-${operation.depth}`,
        isFocused ? "focused" : undefined,
        isHover ? "hover" : undefined,
    ].filter(name => name).join(" ");

    return (
        <div 
            className={className}
            data-id={id}
            // onMouseEnter={handleOnMouseEnter}
            // onMouseLeave={handleOnMouseLeave}
            // onClick={handleOnClick}            
        >
            <OperationView 
                id={operation.id}
                parentId={operation.parentId}
                operationType={operation.operationType}
                children={operation.children}
                depth={operation.depth}
            />
        </div>
    );

    function handleOnClick() {
        console.log("OperationContainer clicked");
        // dispatch(focusOperation(id));
    }

    function handleOnMouseEnter() {
        console.log("OperationContainer hovered");
        // dispatch(hoverOperation(id));
    }

    function handleOnMouseLeave() {
        console.log("OperationContainer unhovered");
        // dispatch(unhoverOperation());
    }
}