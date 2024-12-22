import { useEffect, useState, useReducer } from 'react'
import './App.css'

// import top-level app components
import SourceTables from './components/SourceTables';
import TableStack from "./components/TableStack";
import TablePreview from "./components/TablePreview";
import WorkflowSelector from './components/WorkflowSelector';

function App() {
  return (
      <main className="grid grid-cols-3 gap-2">
        <div>
          <WorkflowSelector />
          <SourceTables />
        </div>
        <div>
          <TableStack />        
          <hr></hr>
          <TablePreview />
        </div>
      </main>
  );

}  // App()

export default App