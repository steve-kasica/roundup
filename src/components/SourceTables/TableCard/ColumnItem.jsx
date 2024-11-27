/**
 * TableCard/ColumnItem.jsx
 * ----------------------------------
 */

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ColumnItem({
    column,
    tableId,
    isChecked,
    onColumnCheck 
}) {
    const {id, name, columnType, index, values} = column;
    const index1 = index + 1;
    const htmlID = `column-input-${id}`;
    const valueCount = Object.keys(values).length;
    
    let typeGlyph;
    switch(columnType) {
        case "categorical": typeGlyph = "<C>"; break;
    }

    return (
        <div className="items-top flex py-1">
            <div className="grid gap-1.5 leading-none">
                <Label 
                    htmlFor={htmlID}
                    className="text-sm font-light leading-none truncate select-none cursor-pointer hover:font-medium"
                >
                    {index1}. {name} {typeGlyph} ({valueCount})
                </Label>
            </div>
            <Checkbox 
                id={htmlID} 
                name={htmlID}
                className="ml-auto"
                checked={isChecked}
                onCheckedChange={isChecked => onColumnCheck(isChecked, tableId, column)}
            />
        </div>
    );
}