import { useEffect } from "react";
import {Table} from "../utilities/data/Table.js";
import workflows from "../../data/example-workflows.js";

export default function Workflow({setWorkflow}) {
    
    const workflowExamples = [...workflows.entries()]
        .map(([value, {label}]) => ({value,label}));
    
    // const updateTables = (workflow) => Promise
    //     .all(options.get(workflow).files.map(fn => 
    //         fetch(`data/${workflow}/${fn}`)
    //         .then(res => res.json()))
    //     )
    //     .then(data => data.map((t, i) => new Table(t, i)))
    //     .then(data => setTables(data));

    // TODO: Load the first workflow by default
    // useEffect(() => updateTables(Array.from(options.keys())[0]), []);

    function onChangeHandler(event) {
        const workflow = workflows.get(event.target.value);
        setWorkflow(workflow.data);
    }

    return (
        <>
            <label>Workflow&nbsp;</label>
            <select onChange={onChangeHandler}>
               <option default value=""></option>
                {workflowExamples.map(({label, value}) => <option key={value} value={value}>{label}</option>)}
            </select>
        </>
    );
}