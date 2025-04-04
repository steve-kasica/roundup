/** 
 * TableView/layouts/RowLayout.jsx
 * 
 * This component handles interaction events that modify global state,
 * independent of table item layout, in order to support different
 * layouts for source table attributes. It also handles some basic styles
 * linked with interaction that's consistent across layout modes.
 * 
 * See:
     *  - [`useDrag`](https://react-dnd.github.io/react-dnd/docs/api/use-drag)
 */
import { useState } from "react";
import { DragPreviewImage, useDrag } from "react-dnd";
import {attributeMap, ID_ATTR, isTable, type as tableInstance} from "../../../../lib/types/Table";
import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import HighlightText from "../../../ui/HighlightText";
import { Typography } from "@mui/material";
import tableIconImage from "../../../../../public/images/table-icon.png";
import { useDispatch, useSelector } from "react-redux";
import { setTableHover } from "../../../../data/tableTreeSlice";
import { createOperation } from "../../../../data/slices/compositeSchemaSlice";

export default function Row({table, isSelected, isHovered}) {
    const id = table[ID_ATTR];
    const {name, rowCount} = table.attributes;
    const values = Array.from(attributeMap.keys()).map(attr => table.attributes[attr]);

    const dispatch = useDispatch();
    const {searchString} = useSelector(({ui}) => ui);
    const [isPressed, setIsPressed] = useState(false);
    
    const [{isDragging}, dragRef, previewRef] = useDrag(() => ({
            type: tableInstance,
            item: {id},
            end: (item, monitor) => {
                const result = monitor.getDropResult();
                if (monitor.didDrop() && item.id === result.id) {
                    // Table has dropped
                    dispatch(createOperation(({
                        table,
                        operationType: result.operationType
                    })));
                }
                setIsPressed(false);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging()
            })
        }),
        []
    );

    const isDisabled = values.join("^").indexOf(searchString) < 0;
    const state = [
        isHovered   ? "hover"       : undefined,
        isSelected  ? "selected"    : undefined,
        isDisabled  ? "disabled"    : undefined,
        isPressed   ? "pressed"     : undefined,        
        isDragging  ? "dragging"    : undefined,        
    ].filter(Boolean).join(" ");

    return (
        <>
            <DragPreviewImage connect={previewRef} src={tableIconImage} />
            <tr className={`TableView ${state}`}
                ref={dragRef}
                onMouseEnter={() => (isSelected) 
                    ? dispatch(setTableHover({
                        tableId: table.id, 
                        isHovered: true
                    }))
                    : null
                }
                onMouseLeave={() => (isSelected) 
                    ? dispatch(setTableHover({
                        tableId: table.id, 
                        isHovered: false
                    }))
                    : null
                }
            >
                <td>
                    {(isSelected) ? <CheckBox /> : <CheckBoxOutlineBlank />}
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        <HighlightText pattern={searchString} text={name} />
                    </Typography>                     
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        {rowCount}
                    </Typography>                     
                </td>
                <td>
                    <Typography color={isDisabled ? "textDisabled" : "normal"}>
                        <ColumnCount tableId={table.id} />
                    </Typography>
                </td>
            </tr>
        </>
    );
}

function ColumnCount({tableId}) {
    const {columns, loading, error} = useSelector(({sourceColumns}) => ({
        columns: sourceColumns.data[tableId],
        loading: sourceColumns.loading,
        error: sourceColumns.error
    }));
    console.log(loading, error, columns)

    if (loading) {
        return <>...</>;
    } else if (error) {
        return <>ERR</>;
    } else if (Array.isArray(columns)) {
        // TODO: fix until fetchRequest TODO is done
        return <>{columns.length}</>;
    } else {
        return <>?</>
    }
}