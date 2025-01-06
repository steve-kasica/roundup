/**
 * StackIssuesTab/index.jsx
 * ------------------------------------------------------------------
 */

import { useDispatch, useSelector } from 'react-redux';
import { silenceIssue, unSilenceIssue } from "../../../data/issuesSlice"
import { ChevronRight } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { SidebarGroupLabel, SidebarMenuSubButton } from '../sidebar';

export default () => {

  const [issues, total] = useSelector(({issues}) => [
    Object.entries(issues.items)
          .map(([id, issue]) => ({...issue, id})),

    Object.values(issues.items)
          .filter(issue => !issue.isSilent)  // Don't include silenced issue in total count
          .map(issue => issue.instances)
          .flat()
          .length
  ]);

    return (
      <SidebarGroup>
        <SidebarGroupLabel>Issues</SidebarGroupLabel>
        <SidebarMenu>
          {issues.map(issue => (
            <IssueItem key={issue.id} issue={issue} />
          ))}           
        </SidebarMenu>
      </SidebarGroup>
    );
}

import { SidebarMenuItem, SidebarMenuButton, SidebarMenuBadge, SidebarMenu, SidebarMenuSub, SidebarMenuSubItem, SidebarGroup } from '../sidebar';

const IssueItem = ({issue}) => {
  const dispatch = useDispatch();
  const {id, name, description, instances, isSilent} = issue;
  const count = instances.length;
  const isDisabled = count === 0;

  return ( 
      <Collapsible asChild className="group/collapsible" disabled={isDisabled}>
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton tooltip={description}>
              <ChevronRight />
              <span>{name}</span>
              <SidebarMenuBadge>{count}</SidebarMenuBadge>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {instances.map(instance => (
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <span>{instance.detail}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
  );

  function onSilenceClickHandler() {
    if (isSilent) {
      dispatch(unSilenceIssue(id));
    } else {
      dispatch(silenceIssue(id));
    }
  }

  // function onExploreClickHandler() {
  //   return null;
  // }
}
/**
 *     // <div className="flex items-center p-1">
    //     <div className="w-5/6">
    //       <div className="text-sm font-medium leading-none">
    //         <TooltipProvider>
    //           <Tooltip>
    //             <TooltipTrigger>
    //               {name}
    //             </TooltipTrigger>
    //             <TooltipContent className="text-sm font-small text-slate-500">
    //               {description}
    //             </TooltipContent>
    //           </Tooltip>
    //         </TooltipProvider>
    //         &nbsp;
    //         <CountBadge count={instances.length} />
    //       </div>
    //     </div>
    //     <div className="w-1/6">
    //       <Button className="mx-1" variant="outline" size="icon" aria-label="silence issue" onClick={onSilenceClickHandler}>
    //         {
    //         (isSilent)
    //           ? <UnSilenceIcon></UnSilenceIcon>
    //           : <SilenceIcon></SilenceIcon>              
    //         }
    //       </Button>
    //       {/ <Button className="mx-1" variant="outline" size="icon" aria-label="explore issue" onClick={onExploreClickHandler}>
    //         <ExploreIcon></ExploreIcon>
    //       </Button> /}
    //     </div>
    // </div>
 */