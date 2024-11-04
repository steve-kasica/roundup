

/**
 * Column.jsx
 */

export default ({column, dispatch, focusedIndex}) => {
    const onChangeHandler = (event) => {
        const isColumnSelected = event.target.checked;
        dispatch({
            type: isColumnSelected ? "add-column" : "delete-column",
            column: column
        });

//             const c = tables[tableIndex].columns[columnIndex];
//             c.setSelected(isColumnSelected);
//             // TODO delete
// //            c.setFocus(isColumnSelected && c.index === focusedIndex);
//             return [...tables];
//        });
    }

    const charLimit = 5;
    const exampleValues = Object.keys(column.values)
        .slice(0,3)
        .map(s => (s.length > charLimit) ? `"${s.slice(0, charLimit)}..."` : `"${s}"`)
        .join(", ");

    return (
        <li>
            <input 
                id={column.key} 
                name={column.key} 
                type="checkbox" 
                onChange={onChangeHandler} />
            <label htmlFor={column.key}>
                {column.name} {`<${column.dataType}>`} ({Object.keys(column.values).length}): {exampleValues}
            </label>
        </li>
    )
};