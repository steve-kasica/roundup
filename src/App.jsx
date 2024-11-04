import { useState } from 'react'
import SourceTables from './components/SourceTables';
import './App.css'


function App() {
  const [tables, setTables] = useState(null);

  return (
    <>
      <div className="grid grid-cols-3 gap-3 h-screen">
        <div className="w-full">
          <SourceTables />
        </div>
        <div className="w-full">
          <p>hey</p>
        </div>
        <div className="w-full">
          <p>Yo</p>
        </div>
      </div>
    </>
 
  )
}

export default App
