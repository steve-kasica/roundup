/**
 * SourceTables/Controls/index.jsx
 */
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./select";

import { useSelector, useDispatch } from "react-redux";
import { sourceColumnGroups } from "@/lib/sourceColumnGroups";
import {  
    setSourceColumnGroup, 
    setSourceColumnSearchString 
} from "@/data/uiSlice";

export default ({isDisabled}) => {
    const dispatch = useDispatch();
    const {sourceColumnGroup} = useSelector(({ui}) => ({
        sourceColumnGroup: sourceColumnGroups.get(ui.sourceColumnGroup)
    }));

    return <div className="flex border rounded-lg border-neutral-200 bg-slate-200 hover:bg-slate-50 hover:border-1 hover:border-slate-200">
        <div className="w-4/6">
            <div className="flex w-full max-w-sm items-center space-x-2">
                <Input 
                    type="text" 
                    disabled={isDisabled}
                    placeholder={sourceColumnGroup.label.toLowerCase()}
                    onChange={(event) => dispatch(setSourceColumnSearchString(event.target.value))}
                />
            </div>        
        </div>
        <div className="w-2/6">
            <Select 
                disabled={isDisabled}
                onValueChange={(value) => dispatch(setSourceColumnGroup(value))}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Groups"></SelectValue>
                </SelectTrigger>
                <SelectContent>
                {[...sourceColumnGroups.entries()].map(([key, obj]) => (
                    <SelectItem key={key} value={key}>
                        {obj.label}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>        
        </div>
    </div>;
}