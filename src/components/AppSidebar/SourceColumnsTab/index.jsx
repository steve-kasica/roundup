/**
 * SourceTables/index.js
 * -------------------------------------------------------------------------
 */


import { group } from "d3";
import { useSelector } from "react-redux";
import { sourceColumnGroups } from "@/lib/sourceColumnGroups";
import { useGetWorkflowSchemasQuery } from "@/services/workflows";
import ColumnGroup from "./ColumnGroup";
import Controls from "./Controls/index.jsx";

export default ({children}) => {
    const {sourceColumnGroup, sourceColumnGroupSearchString, workflow} = useSelector(({ui}) => {
        return {
            ...ui,
            sourceColumnGroup: sourceColumnGroups.get(ui.sourceColumnGroup)
        };
    });
    const { data: tables, error, isLoading } = useGetWorkflowSchemasQuery(workflow);
    const isDisabled = error || isLoading;

    let columns, columnGroups;
    if (tables) {
        columns = !tables ? [] : tables
            .map(table => table.columns.map(column => ({...column, tableName: table.name})))
            .flat();

        columnGroups = Array.from(group(columns, sourceColumnGroup.func));   
        columnGroups.sort(columnGroupSorter);
    }

    return <>
        {children}
        <Controls isDisabled={isDisabled}></Controls>
        {
            error ? (
                null
            ) : isLoading ? (
                null
            ) : tables ? (
                columnGroups.map(([groupKey, columns]) => (
                    <ColumnGroup 
                        key={groupKey} 
                        label={groupKey}
                        columns={columns} />
                ))
            ) : null
        }
    </>;

    /**
     * @name: columnGroupSorter
     * @description: A callback function to Array.prototype.sort for sorting
     * groups of columns. Note that `a` and `b` must be cast to String in order to 
     * sort by column index. 
     * @param {Array} param1: [columnGroupKey, <columns>] 
     * @param {Array} param2: [columnGroupKey, <columns>]
     * @returns None (sorts inplace)
     */
    function columnGroupSorter([key1], [key2]) {
        const a = String(key1).includes(sourceColumnGroupSearchString);
        const b = String(key2).includes(sourceColumnGroupSearchString);
        if (a && b || !a && !b) {
            return 0;
        } else if (a && !b) {
            return -1;
        } else if (!a && b) {
            return 1;
        }
    }

}