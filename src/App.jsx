import { useEffect, useState, useReducer } from 'react'
import './App.css'

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

// import Table from './lib/Table';
import workflows from "@/data/example-workflows.js";

// import top-level app components
import SourceTables from './components/SourceTables';
import TableStack from "./components/TableStack";
// import ColumnInspector from './components/ColumnInspector';
// import TablePreview from "./components/TablePreview";

function App() {
  const options = [...workflows.entries()].map(([value, {label}]) => ({value, label}));
  const [workflow, setWorkflow] = useState(options[0].value);
  const [tables, setTables] = useState([]);
  const [focusIndex, setFocusIndex] = useState(undefined);
  const [operations, dispatch] = useReducer(operationsReducer, new Map());

  useEffect(() => {
    const promises = Object.entries(workflows.get(workflow).data)
        .map(([path, f]) => f()
            .then(module => ({...module.default})));

    Promise.all(promises)
      .then(tables => { 
        return tables.map((table, i) => ({
          ...table, 
          columns: table.columns.map((column, j) => ({...column, id: `${i}-${j}`}))
        }))
      })
      .then(tables => setTables(tables));
  }, [workflow]);

  return (
      <main className="grid grid-cols-3 gap-2">
        <div>
          <Select onValueChange={setWorkflow}>
              <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Select a workflow" />
              </SelectTrigger>
              <SelectContent>
                {options.map(({value, label}) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          <SourceTables 
            tables={tables}
            onCheckColumns={handleSelectColumns}
            onUncheckColumns={handleDeselectColumns}
          />
        </div>
        <div>
          {<TableStack
            focusIndex={focusIndex}
          />/*
        
          <hr></hr>
          <TablePreview 
            tables={tables}
            focusIndex={focusIndex}
          /> */}
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

// function positionReducer(state, {type, payload}) {

//   switch(type) {
//     case "SELECT_COLUMNS":
//       state.set([payload.x, payload.y], [])
//       state.has(payload.x)
//   }

//   return new Map(state);
// }

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
