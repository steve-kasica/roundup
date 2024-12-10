import { useEffect, useState, useReducer } from 'react'
import './App.css'

// import top-level app components
import SourceTables from './components/SourceTables';
import TableStack from "./components/TableStack";
import TablePreview from "./components/TablePreview";
import WorkflowSelector from './components/WorkflowSelector';
// import ColumnInspector from './components/ColumnInspector';

function App() {
  const [workflow, setWorkflow] = useState(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const [operations, dispatch] = useReducer(operationsReducer, new Map());

  return (
      <main className="grid grid-cols-3 gap-2">
        <div>
          <WorkflowSelector setWorkflow={setWorkflow} />
          <SourceTables workflow={workflow} />
        </div>
        <div>
          <TableStack focusIndex={focusIndex} />        
          <hr></hr>
          <TablePreview />
        </div>
        {/* <div>
          <ColumnInspector 
            tables={tables}
            focusIndex={focusIndex}
          />
        </div> */}
      </main>
  );

  function handleExampleDataLoad(tables) {
    const action = {
      type: "SET_TABLES",
      payload: tables
    };
    return dispatch(action);
  }

  function handleSelectColumns(columnArray) {
    const action = { 
      type: "ADD_OPERATIONS",
      payload: columnArray.map(column => ops.addColumnBySourcePosition(column)),
    };
    return dispatch(action);
  }

  function handleDeselectColumns(columnArray) {
    const action = { 
      type: "ADD_OPERATIONS",
      payload: columnArray.map(column => ops.removeColumn(column)),
    };
    return dispatch(action);
  }

  // Note: React will call this function once in development mode
  function handleSwapTableColumns([columnA, columnB]) {
    const action = {
      type: "SET_COLUMN_INDEX",
      payload: [
        { column: columnA, value: columnB.index },
        { column: columnB, value: columnA.index }
      ]
    };
    return dispatch(action);
  }

}  // App()

function operationsReducer(state, {type, payload}) {
  switch(type) {
    case "ADD_OPERATIONS":
    case "UPDATE_OPERATIONS":
      payload.forEach(func => state.set(func.id, func));
      break;
    case "REMOVE_OPERATIONS":
      payload.forEach(func => state.delete(func.id));
      break;
  }
  return new Map(state);
}

// Note: React will call tableReducer twice in development mode
function tablesReducer(state, {type, payload}) {
  switch(type) {
    case "SET_TABLES":
      return payload;
    case "SELECT_COLUMNS":
      payload.table.selectColumns(payload.columnIds);
      break;
    case "DESELECT_COLUMNS":
      payload.table.deselectColumns(payload.columnIds);
      break;
    case "SET_COLUMN_INDEX":
      payload.forEach(({column, value}) => column.index = value);
      break;
    default:
      throw Error("Unknown action: " + type);
  }
  return [...state];  // Return a new array object so React knows state has updated
}

export default App