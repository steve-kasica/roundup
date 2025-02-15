/**
 * WorkflowSelector.jsx
 * -----------------------------------------------------------------------------
 */

import { useGetWorkflowsQuery } from '@/services/workflows';
import { useDispatch } from "react-redux";
import { setWorkflow } from "@/data/uiSlice";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"  
import { reset } from '../data/tableTreeSlice';
import { setStage, STAGE_ARRANGE_TABLES } from '../data/uiSlice';

export default () => {
    const dispatch = useDispatch();
    const {data, error, isLoading} = useGetWorkflowsQuery();
    
    return (
        <Select onValueChange={onValueChangeHandler}>
            <SelectTrigger>
                <SelectValue placeholder="Select example workflow" />
            </SelectTrigger>
            <SelectContent>
                {
                        error ? (
                            <></>
                        ) : isLoading ? (
                            <></>
                        ) : data ? (
                            data.workflows.map(({value, label}) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))
                        ) : null
                    }
            </SelectContent>
        </Select>
    );

    function onValueChangeHandler(workflow) {
        dispatch(setWorkflow(workflow));
        dispatch(reset());
        // dispatch(setStage(STAGE_ARRANGE_TABLES));
    }
}