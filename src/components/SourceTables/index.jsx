/**
 * SourceTables/index.js
 * -------------------------------------------------------------------------
 */

import { Input } from "@/components/ui/input"
import { useState } from "react";

import TableCard from "./TableCard";

import { useDispatch } from "react-redux";
import { 
    selectTable, 
    deselectTable, 
    selectColumn, 
    deselectColumn 
} from "../../data/schemaSlice";

export default ({ tables }) => {
    if (tables.length === 0) {
        return <></>;
    }

    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState("");

    const results = tables
        // Sort results so matches appear first
        .sort((t1, t2) => {
            const a = t1.name.includes(searchString);
            const b = t2.name.includes(searchString);
            if (a && b || !a && !b) {
                return 0;
            } else if (a && !b) {
                return -1;
            } else if (!a && b) {
                return 1;
            }
        });

    return (
        <>
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input 
                    type="text" 
                    placeholder="Search table names" 
                    onChange={(event) => setSearchString(event.target.value)}
                />        
            </div>

            <div className="flex-1 h-screen overflow-y-auto">
                {results.map((table, tableIndex) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            searchString={searchString}
                            onTableCheck={onTableCheck}
                            onColumnCheck={onColumnCheck}
                        />
                ))}
            </div>
        </>
    );

    function onColumnCheck(isChecked, tableId, column) {
        if (isChecked) {
            dispatch(selectColumn({ column, tableId }));
        } else {
            dispatch(deselectColumn({ column }));
        }
    }

    function onTableCheck(isChecked, columns) {
        if (isChecked) {
            dispatch(selectTable({ columns }));
        } else {
            dispatch(deselectTable({ columns }));
        }
    }

}