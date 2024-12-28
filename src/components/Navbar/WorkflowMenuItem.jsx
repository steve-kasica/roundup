/**
 * src/components/Navbar/WorkflowSelector.jsx
 * -----------------------------------------------------------------------------
 */

import { useGetWorkflowsQuery } from '@/services/workflows';
import { useDispatch, useSelector } from "react-redux";
import { setWorkflow } from "@/data/uiSlice";
import { 
    NavigationMenuContent, 
    NavigationMenuTrigger, 
    NavigationMenuLink, 
    NavigationMenuItem 
} from "./navigation-menu";

export default () => {
    const dispatch = useDispatch();
    const {data, error, isLoading} = useGetWorkflowsQuery();
    const currentWorkflow = useSelector(({ui}) => ui.workflow);
    
    return (
        <NavigationMenuItem>
            <NavigationMenuTrigger>Example workflows</NavigationMenuTrigger>
            <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[400px]">
                    {
                        error ? (
                            <>Error</>
                        ) : isLoading ? (
                            <>Loading...</>
                        ) : data ? (
                            data.workflows.map(({value, label}) => (
                                <WorkflowOption 
                                    key={value} 
                                    onClick={onClickHandler}
                                    isChecked={(value === currentWorkflow)}
                                    value={value}
                                >
                                        {label}
                                </WorkflowOption>
                            ))
                        ) : null
                    }
                </ul>
            </NavigationMenuContent>
        </NavigationMenuItem>
    );

    function onClickHandler(value) {
        dispatch(setWorkflow(value));
    }
}

const WorkflowOption = ({value, isChecked, onClick, children}) => {

    const checkedIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
     </svg>;  

    return (
        <li>
            <NavigationMenuLink asChild>
                <a 
                    className="block select-none space-y-1 rounded-md p-3 leading-none cursor-pointer no-underline outline-none transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900"
                    onClick={() => onClick(value)}>
                    <div className="text-sm font-medium leading-none">
                    {isChecked ?  checkedIcon : ""}{children}
                    </div>
                </a>                
            </NavigationMenuLink>
        </li>
    )
}
