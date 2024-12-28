

import { BellIcon } from '@heroicons/react/24/outline';
import { NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent } from './navigation-menu';
import { Button } from "@/components/ui/button.tsx"; 

export default () => {

    const issues = [
      { id: "123", name: "Null cells", description: "Cells are null"},
      { id: "321", name: "Mismatched column names", description: "Source columns have different names"}
    ];

    const areRedFlags = issues.length > 0;

    return (
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            Issues&nbsp;
            <span className={`inline-flex items-center rounded-md ${areRedFlags ? "bg-red-50" : "bg-gray-50"} px-2 py-1 text-xs font-medium ${areRedFlags ? "text-red-600" : "text-gray-500"} ring-1 ring-inset ${areRedFlags ? "ring-red-600/10" : "ring-gray-500/10"}`}>
              {issues.length}
            </span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid grid-cols-1 p-4 w-[400px] divide-y">
              {issues.map(props => (
                <IssueItem 
                  key={props.id}
                  name={props.name}
                  description={props.description}
                />
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
    );
}

const IssueItem = ({name, description}) => {

  return (
    <div className="flex p-1">
        <div className="w-4/6">
          <div className="text-sm font-medium leading-none">{name}</div>
          <p className="text-sm font-small text-slate-500">{description}</p>
        </div>
        <div className="w-2/6">
          <Button className="mx-1" variant="outline" size="icon" aria-label="silence issue" onClick={onSilenceClickHandler}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.97m1.965-2.277L21 21m-4.225-4.225a23.81 23.81 0 0 0 3.536-1.003A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6.53 6.53m10.245 10.245L6.53 6.53M3 3l3.53 3.53" />
            </svg>
          </Button>
          <Button className="mx-1" variant="outline" size="icon" aria-label="explore issue" onClick={onExploreClickHandler}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </Button>
        </div>
    </div>
  );

  function onSilenceClickHandler() {

  }

  function onExploreClickHandler() {

  }
}