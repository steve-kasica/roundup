/**
 * WorkflowSelector.jsx
 * -----------------------------------------------------------------------------
 */

import { useGetWorkflowsQuery } from '@/services/workflows';
import { useDispatch, useSelector } from "react-redux";
import { setWorkflow } from "@/data/uiSlice";
import { reset } from '../data/tableTreeSlice';
import { Button, Card, CardActionArea, CardActions, CardContent, CardHeader, IconButton, Link } from '@mui/material';
import { setStage, STAGE_ARRANGE_TABLES } from '../data/uiSlice';
import { Launch } from '@mui/icons-material';

export default () => {
    const dispatch = useDispatch();
    const {data, error, isLoading} = useGetWorkflowsQuery();
    const {workflow: activeWorkflow} = useSelector(({ui}) => ui);
    
    return (
        <>
            {
            error ? (
                <></>
            ) : isLoading ? (
                <></>
            ) : data ? (
                data.workflows.map((workflow) => (
                    <Card key={workflow.value} variant="outlined">
                        <CardActionArea
                            onClick={() => handleWorkflowChange(workflow)}
                            data-active={activeWorkflow && activeWorkflow.value === workflow.value ? "" : undefined}
                            sx={{
                                "&[data-active]": {
                                    backgroundColor: "action.selected",
                                    "&:hover": {
                                        backgroundColor: "action.selectedHover"
                                    }
                                }
                            }}
                        >
                            <CardHeader
                                title={workflow.label}
                                subheader={workflow.organization}
                            />
                        </CardActionArea>
                    </Card>
                ))
            ) : null
            }
        </>
    );

    function handleWorkflowChange(workflow) {
        dispatch(setWorkflow(workflow));
        dispatch(reset());
    }
}