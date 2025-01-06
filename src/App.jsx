import './App.css'

// import top-level app components
import TableStack from "./components/TableStack";
import TablePreview from "./components/TablePreview";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./components/AppSidebar/sidebar";
import { AppSidebar } from "./components/AppSidebar";

import { useSelector, useDispatch } from 'react-redux';
import { setSidebarStatus, SIDEBAR_CLOSED } from './data/uiSlice';
import WorkflowSelector from './components/AppSidebar/WorkflowSelector';

function App() {
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector(({ui}) => ui.sidebarStatus !== SIDEBAR_CLOSED);

  return (
    <SidebarProvider open={isSidebarOpen}>
      <AppSidebar/>
      <SidebarInset>
      <header className="flex w-full h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger onClick={onSidebarTriggerClickHandler} />
          <div className="ml-auto mr-1">
            <WorkflowSelector></WorkflowSelector>            
          </div>
      </header>
      <main>
        <TableStack />        
            <hr></hr>
        <TablePreview />
      </main>
      </SidebarInset>
    </SidebarProvider>
  );

  function onSidebarTriggerClickHandler() {
    dispatch(setSidebarStatus(SIDEBAR_CLOSED));
  }
}

export default App