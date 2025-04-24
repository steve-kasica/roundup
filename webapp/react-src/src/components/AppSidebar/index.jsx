// import { ChevronDown, Home, Inbox, Search, Settings } from "lucide-react"

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarHeader,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "./sidebar"

// import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
//   } from "@/components/ui/tooltip"

// import {
//     Tabs,
//     TabsContent,
//     TabsList,
//     TabsTrigger,
//   } from "./tabs"

// import WorkflowSelector from "./WorkflowSelector";
// import SourceColumnsTab from "./SourceColumnsTab";
// import StackIssuesTab from "./StackIssuesTab";
// import ConfigTab from "./ConfigTab";

// import { ViewColumnsIcon, FlagIcon, CogIcon } from "@heroicons/react/16/solid";

// import { useDispatch, useSelector } from "react-redux";
// import {
//     setSidebarStatus,
//     SIDEBAR_SOURCE_COLUMNS,
//     SIDEBAR_CONFIG,
//     SIDEBAR_ISSUES,
//     SIDEBAR_CLOSED
// } from "../../data/uiSlice";

// const issueFillAlert = "fill-red-500";
// const defaultIconFill = "fill-slate-500";

// export function AppSidebar() {
//     const dispatch = useDispatch();
//     const [sidebarStatus, areIssues] = useSelector(({ui, issues}) => [
//         ui.sidebarStatus,
//         (Object.values(issues.items).map(item => item.instances).flat().length > 0)
//     ]);
//     const isClosed = (sidebarStatus === SIDEBAR_CLOSED);

//   return (
//     <Sidebar collapsible="icon">
//         <SidebarContent>
//             <Tabs
//                 defaultValue={SIDEBAR_SOURCE_COLUMNS}
//                 orientation="vertical"
//                 onValueChange={onValueChangeHandler}
//                 className="flex flex-row h-full"
//             >
//                 <TabsList className="shrink-0 w-[--sidebar-width-icon]">
//                     <MenuItem value={SIDEBAR_SOURCE_COLUMNS} label="Source columns">
//                         <ViewColumnsIcon className={defaultIconFill} />
//                     </MenuItem>
//                     <MenuItem value={SIDEBAR_ISSUES} label="Issues">
//                         <FlagIcon className={areIssues ? issueFillAlert : defaultIconFill } />
//                     </MenuItem>
//                     <MenuItem value={SIDEBAR_CONFIG} label="Configuration">
//                         <CogIcon className={defaultIconFill} />
//                     </MenuItem>
//                 </TabsList>
//                 <div className="flex-1 shrink-0 p-2 w-[--sidebar-content-width] bg-white">
//                     <TabsContent value={SIDEBAR_SOURCE_COLUMNS}>
//                         <SourceColumnsTab />
//                     </TabsContent>
//                     <TabsContent value={SIDEBAR_ISSUES}>
//                         <StackIssuesTab />
//                     </TabsContent>
//                     <TabsContent value={SIDEBAR_CONFIG}>
//                         <ConfigTab />
//                     </TabsContent>
//                 </div>
//             </Tabs>
//       </SidebarContent>
//     </Sidebar>
//   );

//   /**
//    * Close sidebar if clicking icon of open tab
//    * @param {*} nextStatus
//    */
//   function onValueChangeHandler(nextStatus) {
//     const payload = (nextStatus === sidebarStatus) ? SIDEBAR_CLOSED : nextStatus
//     dispatch(setSidebarStatus(payload));
//   }
// }

// function MenuItem({value, label, children}) {
//     const isActive = useSelector(({ui}) => (value === ui.sidebarStatus));
//     return (
//         <TabsTrigger
//             value={value}
//             className={`cursor-pointer my-2 ${isActive ? "bg-neutral-100" : ""}`}
//             variant="outline"
//             size="icon"
//         >
//             <TooltipProvider>
//                 <Tooltip>
//                     <TooltipTrigger asChild>
//                         {children}
//                     </TooltipTrigger>
//                     <TooltipContent side="right">
//                     <p>{label}</p>
//                 </TooltipContent>
//                 </Tooltip>
//             </TooltipProvider>
//         </TabsTrigger>
//     );

// }
