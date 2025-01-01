/**
 * IssuesMenuItem.jsx
 * ------------------------------------------------------------------
 */

import { useDispatch, useSelector } from 'react-redux';
import {silenceIssue, unSilenceIssue} from "../../data/issuesSlice"
import { 
  BellSnoozeIcon, 
  BellIcon, 
  MagnifyingGlassIcon, 
} from "@heroicons/react/16/solid";

import { 
  NavigationMenuItem, 
  NavigationMenuTrigger, 
  NavigationMenuContent 
} from './navigation-menu';
import { Button } from "@/components/ui/button.tsx"; 
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SilenceIcon = BellSnoozeIcon;
const UnSilenceIcon = BellIcon;
const ExploreIcon = MagnifyingGlassIcon;

const CountBadge = ({count}) => {
  const isSilent = count === 0;
  return (
    <span className={`inline-flex items-center rounded-md ${isSilent ? "bg-gray-50 text-gray-500 ring-gray-600/10" : "bg-red-50 text-red-600 ring-red-500/10"} px-2 py-1 text-xs font-medium ring-1 ring-inset`}>
      {count}
    </span>
  );
};

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
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            Issues&nbsp;<CountBadge count={total} />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-1 p-4 w-[400px] divide-y">
              {issues.map(issue => (
                <IssueItem key={issue.id} issue={issue} />
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
    );
}

const IssueItem = ({issue}) => {
  const dispatch = useDispatch();
  const {id, name, description, instances, isSilent} = issue;

  return (
    <div className="flex items-center p-1">
        <div className="w-5/6">
          <div className="text-sm font-medium leading-none">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {name}
                </TooltipTrigger>
                <TooltipContent className="text-sm font-small text-slate-500">
                  {description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            &nbsp;
            <CountBadge count={instances.length} />
          </div>
        </div>
        <div className="w-1/6">
          <Button className="mx-1" variant="outline" size="icon" aria-label="silence issue" onClick={onSilenceClickHandler}>
            {
            (isSilent)
              ? <UnSilenceIcon></UnSilenceIcon>
              : <SilenceIcon></SilenceIcon>              
            }
          </Button>
          {/* <Button className="mx-1" variant="outline" size="icon" aria-label="explore issue" onClick={onExploreClickHandler}>
            <ExploreIcon></ExploreIcon>
          </Button> */}
        </div>
    </div>
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