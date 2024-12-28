import { useEffect, useState, useReducer } from 'react'
import './App.css'

// import top-level app components
import SourceTables from './components/SourceTables';
import TableStack from "./components/TableStack";
import TablePreview from "./components/TablePreview";
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar></Navbar>
      <main className="grid grid-cols-3 gap-2">
        <div>
          <SourceTables />
        </div>
        <div>
          <TableStack />        
          <hr></hr>
          <TablePreview />
        </div>
      </main>
    </>
  );

}  // App()

export default App