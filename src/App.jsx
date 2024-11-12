import { useEffect, useState, useReducer } from 'react'
import SourceTables from './components/SourceTables';
import './App.css'

import workflows from "@/data/example-workflows.js";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import TableStack from "@/components/TableStack";
import ColumnInspector from './components/ColumnInspector';

import Table from './lib/Table';

function App() {
  const options = [...workflows.entries()].map(([value, {label}]) => ({value, label}));
  const [workflow, setWorkflow] = useState(options[0].value);

  const [tables, dispatch] = useReducer(tablesReducer, []);
  const handleSelectColumns = (columns) => dispatch({ type: "SELECT", columns });
  const handleDeselectColumns = (columns) => dispatch(({ type: "DESELECT", columns }));
  const handleSwapTableColumns = (columnA, columnB) => dispatch({
    type: "SET_COLUMN_INDEX",
    payload: [
      { column: columnA, value: new Number(columnB.index) },
      { column: columnB, value: new Number(columnA.index) }
    ]
  });

  // const [transforms, transformsDispatch] = useReducer(transformsReducer, []);
  // const [positionMap, updatePositionMap] = useState(new Map());
  
  const focusIndex = 0;

  useEffect(() => {
    const promises = Object.entries(workflows.get(workflow).data)
        .map(([path, f]) => f()
            .then(module => ({...module.default})));

    Promise.all(promises)
      .then(data => {
        const maxColumns = Math.max(...data.map(({columns}) => columns.length));
        return data.map((d,i) => new Table(d, i, maxColumns));
      })
      .then(data => dispatch({type: "SET_INITIAL_DATA", data: data}));
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
            onAddColumns={handleSelectColumns}
            onRemoveColumns={handleDeselectColumns}
          />
        </div>
        <div>
          <TableStack
            tables={tables}
            onCellSwap={handleSwapTableColumns}
            focusIndex={focusIndex}
          />
        </div>
        <div>
          <ColumnInspector 
            tables={tables}
            focusIndex={focusIndex}
          />
          <hr />
          {/* <TransformsList 
            transforms={transforms}
          /> */}
        </div>
      </main>
  );
}

// function transformsReducer(state, {type, payload}) {

//   let currTransform;
//   switch(type) {
//     case "SWAP_TABLE_COLUMNS":
//       currTransform = transforms.swapTableColumns(payload);
//       break;
//   }

//   if (state.size > 0) {
//     let prevId = [...state.entries()].pop()[0];
//     if (currTransform.id !== prevId) {
//       state.set(currTransform.id, currTransform);
//       return new Map(state);
//     } else {
//       return state;
//     }
//   } else {
//     state.set(currTransform.id, currTransform);
//     return new Map(state);
//   }
// }

function tablesReducer(state, action) {
  switch(action.type) {
    case "SET_INITIAL_DATA":
      return action.data;
    case "SELECT":
      action.columns.forEach(column => column.setSelected(true));
      break;
    case "DESELECT":
      action.columns.forEach(column => column.setSelected(false));
      break;
    case "SET_COLUMN_INDEX":
      action.payload.forEach(({column, value}) => column.index = value);
      break;
    default:
      throw Error("Unknown action: " + action.type);
  }
  return [...state];
}

export default App
