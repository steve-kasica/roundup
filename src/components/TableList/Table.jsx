/**
 * Table.jsx
 */


import Column from "./Column";
import Table from "../../../utilities/Table";

export default ({data, searchTerm, dispatch, focusedIndex}) => {
    const table = new Table(data);

    const onChangeHandler = (event) => {
        const isTableSelected = event.target.checked;

        // Update UI, silently, not triggering onChange event
        const children = event.target.nextSibling.nextSibling.children;
        for (const li of children) {
            const input = li.children[0];
            input.checked = isTableSelected;
        }
        
        // Update application state
        // setTables(tables => {
        //     const t = tables[index];

        //     // Select to deselect all columns within the table
        //     t.setSelected(isTableSelected);


        //     if (t.focusedIndex === undefined) {
        //         t.setFocus(focusedIndex);
        //     } 

        //     return [...tables];  // React requies new object to update state
        // });
    };

    return (
        <li>
            <input 
                id={table.key} 
                name={table.key} 
                type="checkbox" 
                onChange={onChangeHandler} />
            <label htmlFor={table.key}>{table.name}</label>
            {<ul>
                {/* {table.columns
                    .filter(c => searchTerm.length > 0 ? c.contains(searchTerm) : true)
                    .map(c => 
                        <Column
                            column={c}
                            dispatch={dispatch}
                            focusedIndex={focusedIndex}>
                        </Column>
                    )
                } */}
            </ul>}            
        </li>
    );

};