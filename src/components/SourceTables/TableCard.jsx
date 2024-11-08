/**
 * TableCard.jsx
 * ------------------------------------------------------------------
 */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch";

import TableIcon from "./TableIcon.jsx";

import { ChevronDown } from "lucide-react"  

function ColumnItem({ column, isChecked, onAddColumns, onRemoveColumns }) {
    const id = `column-input-${column.key}`;

    function checkedChangeHandler(isChecked) {
        if (isChecked) {
            onAddColumns([column])
        } else {
            onRemoveColumns([column]);
        }
    }

    return (
        <div className="items-top flex py-1">
            <div className="grid gap-1.5 leading-none">
                <Label 
                    htmlFor={id}
                    className="text-sm font-light leading-none truncate select-none cursor-pointer hover:font-medium"
                >
                    {column.index1}. {column.name} ({column.uniqValues})
                </Label>
            </div>
            <Checkbox 
                id={id} 
                name={id}
                className="ml-auto"
                checked={isChecked}
                onCheckedChange={checkedChangeHandler}
            />            
        </div>
    );
}

function TableCard({table, searchString, onAddColumns, onRemoveColumns}) {
    const iconWidth = 50;
    const iconHeight = iconWidth; // Make icon square

    function Title({word, substring}) {
        if (word.includes(substring)) {
            const beginning = word.slice(0, word.indexOf(substring));
            const end = word.slice(word.indexOf(substring) + substring.length);
            return (
                <>
                    {beginning}<span className="underline decoration-dotted decoration-indigo-500">{substring}</span>{end}
                </>
            )
        } else {
            return <>{word}</>;
        }
    }

    // Select, or de-select, all columns
    function selectAll(isChecked) {
        if (isChecked) {
            onAddColumns(table.nonNullColumns);
        } else {
            onRemoveColumns(table.nonNullColumns);
        }
    }

    return (
        <Card className="my-4 snap-start">
            <Collapsible>
                <CardHeader className="flex flex-row p-2">
                    <div className="basis-1/4">
                        <TableIcon 
                            width={iconWidth}
                            height={iconHeight}
                            padding={0.2}
                            roundness={0}
                            columns={table.column_count}
                            rows={table.row_count} />
                    </div>
                    <div className="basis-1/4">
                        <CardTitle className="text-md">
                            <Title word={table.name} substring={searchString} />
                        </CardTitle>
                        <CardDescription>{table.column_count} x {table.row_count}</CardDescription>                    
                    </div>
                    <div className="basis-1/2 flex items-center">
                    {/* <h4 className="text-sm font-semibold">Columns</h4> */}
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-auto p-0">
                            <ChevronDown className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                    <Switch 
                        onCheckedChange={selectAll}
                    />
                </div>                    
                </CardHeader>
            <CardContent className="p-0">
                <CollapsibleContent className="py-4 px-2">
                    {
                    table.columns
                        .filter(column => !column.isNull)
                        .map(column => (
                            <ColumnItem 
                                key={column.key}
                                column={column}
                                isChecked={column.isSelected}
                                onAddColumns={onAddColumns}
                                onRemoveColumns={onRemoveColumns}
                            />
                        ))
                    }
                </CollapsibleContent>
            </CardContent>
        </Collapsible>            
        </Card>
    );
}

export default TableCard;