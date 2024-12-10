/**
 * WorkflowSelector/index.jsx
 */

import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from "./select";

  import { useGetWorkflowsQuery } from '../../services/workflows';

export default ({setWorkflow}) => {

    const {data, error, isLoading} = useGetWorkflowsQuery();
    
    return <>
            {
                error ? (
                    <>Error</>
                ) : isLoading ? (
                    <>Loading...</>
                ) : data ? (
                    <Select onValueChange={setWorkflow}>
                        <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Select a workflow" />
                        </SelectTrigger>
                        <SelectContent>
                            {data.workflows.map(({value, label}) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : null 
            }
        </>;
}