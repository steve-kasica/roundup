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
import { useGetWorkflowSchemasQuery } from "../../services/workflows";

export default ({ workflow }) => {
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState("");

    const { data, error, isLoading } = useGetWorkflowSchemasQuery(workflow);

    return <>
        {
            error ? (
                <ErrorState />
            ) : isLoading ? (
                <LoadingState />
            ) : data ? (
                <>
                    <div className="flex w-full max-w-sm items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="Search table names" 
                            onChange={(event) => setSearchString(event.target.value)}
                        />        
                    </div>
                    <div className="flex-1 h-screen overflow-y-auto">
                        {[...data].sort(sorter).map((table) => (
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
            ) : null
        }
    </>

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

    function sorter(t1, t2) {
        const a = t1.name.includes(searchString);
        const b = t2.name.includes(searchString);
        if (a && b || !a && !b) {
            return 0;
        } else if (a && !b) {
            return -1;
        } else if (!a && b) {
            return 1;
        }
    }

    function ErrorState() {
        return <>Error</>
    }
    
    function LoadingState() {
        return <>Loading...</>
    }

}