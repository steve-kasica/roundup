
import { useEffect, useState } from "react";
import Workflow from "./Workflow";
import TableList from "./TableList";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  
import workflows from "../../data/example-workflows.js";

export default () => {
    const options = [...workflows.entries()].map(([value, {label}]) => ({value, label}));
    const [workflow, setWorkflow] = useState(options[0].value);
    const [data, setData] = useState([]);

    useEffect(() => {
        const promises = Object.entries(workflows.get(workflow).data)
            .map(([path, f]) => f()
                .then(schema => ({...schema})));

        Promise.all(promises).then(setData);
    }, [workflow]);


    return (
        <>
            <Select onValueChange={setWorkflow}>
                <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Select a workflow" />
                </SelectTrigger>
                <SelectContent>
                    {options.map(({value, label}) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectContent>
            </Select>

            <div>
                {data.map(d => <Card>
                    <CardHeader>
                        <CardTitle>{d.name}</CardTitle>
                        <CardDescription>{d.columns.length} x ?</CardDescription>
                        {/* <CardContent>
                        </CardContent> */}
                    </CardHeader>
                </Card>)}
            </div>
            {/* <Workflow setWorkflow={setWorkflow} /> */}
            {/* <TableList workflow={workflow} /> */}
        </>
    );
}