/**
 * TableLayout.jsx
 * -------------------------------
 */
import { attributeMap } from "../../../../lib/types/Table";
import { Button, Checkbox } from "@mui/material";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";
import { ascending, descending } from "d3";
import Row from "./Row";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchTablesRequest } from "../../../../data/slices/sourceTablesSlice";

const tableAttributes = Array.from(attributeMap.entries(), ([attr, label]) => ({attr, label}));

export default function TableLayout({ handleSelectAllClick }) {
  const dispatch = useDispatch();
  const [sortAttribute, setSortAttribute] = useState(tableAttributes.at(0).attr);
  const [isAscending, setIsAscending] = useState(true);

  // TODO (optimization)
  // memoize selector here for sourceTables, sourceTable and isAscending and sortAttribute
  const {sourceTables, loading, error} = useSelector(({sourceTables}) => ({
    sourceTables: Array.from(
        Object.entries(sourceTables.data), ([id, table]) => (table)
      )
      .toSorted((a, b) => (isAscending)
        ? ascending(a.attributes[sortAttribute], b.attributes[sortAttribute])
        : descending(a.attributes[sortAttribute], b.attributes[sortAttribute])),
    loading: sourceTables.loading,
    error: sourceTables.error
    })
  );

  useEffect(() => {
      dispatch(fetchTablesRequest());
  }, [dispatch]);

  const selectedTableIds = new Set();

  // const areAllTablesSelected = (sourceTables.length === selectedTableIds.size);
  // const areSomeTablesChecked = selectedTableIds.size > 0;
  const areAllTablesSelected = false;
  const areSomeTablesChecked = false;

  return (
    <div className="table-layout">
      <table>
        <thead>
          <tr>
            <th>
              {/* TODO (guidance): a check-all button could be an easy way for the user
                to specify that it wants the system to make an attempt at automagically
                combining the tables currently in the selection, with or without the 
                already selected tables
               */}
              {/* <Checkbox 
                edge="start"
                tabIndex={-1}
                checked={areAllTablesSelected}
                indeterminate={!areAllTablesSelected && areSomeTablesChecked}
                onChange={(event) => handleSelectAllClick(event.target)}
                disableRipple
              /> */}
            </th>
            {tableAttributes.map(({attr, label}) => (
              <th 
                key={attr}
                className="table-head"
              >
                  <Button 
                    color="danger"
                    sx={{
                      width: "100%", 
                      textAlign: "left"
                    }} 
                    onClick={() => {
                      if (sortAttribute === attr) {
                        setIsAscending(!isAscending);
                      } else {
                        setSortAttribute(attr)
                      }
                    }}
                  >
                    {label}
                    <SortIcon attr={attr} />
                  </Button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(loading || error) ? (
            <p>Loading/error</p>
          ) : 
          sourceTables.map(table => {
            const isSelected = selectedTableIds.has(table.id);
            return (<Row 
              key={table.id}
              table={table} 
              isSelected={isSelected}
              isHovered={(isSelected && false)}
            />);
          })}
        </tbody>
      </table>
    </div>
  ); // end return statement

  function SortIcon({attr}) {
    if (sortAttribute === attr) {
      if (isAscending) {
        return <ArrowUp />
      } else {
        return <ArrowDown />
      }
    } else {
      return null;
    }
  }
}
