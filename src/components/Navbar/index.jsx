import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
  } from "./navigation-menu"  
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import WorkflowMenuItem from './WorkflowMenuItem';
import IssuesMenuItem from './IssuesMenuItem';

export default function Navbar() {
  return (
    <NavigationMenu delayDuration={100}>
        <NavigationMenuList>
            <WorkflowMenuItem />
            <IssuesMenuItem />
        </NavigationMenuList>
    </NavigationMenu>
  )
}