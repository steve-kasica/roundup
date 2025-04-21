export default function ColumnIndexContainer({}) {
  return (
    <form key={j}>
      <div
        className="index-label"
        // onClick={() => {
        //     const columns = tables
        //         .map(table => (j < table.columnCount) ? table.columns.at(j) : null)
        //         .filter(column => column);
        //     // const isIndexSelected = columns.filter(column => column.isSelected).length === columns.length;
        //     const isIndexSelected = false;
        //     if (isIndexSelected) {
        //         // If every column in the index is selected, unselect all columns in the index
        //         columns.forEach(column => dispatch(setColumnProperty({
        //             column,
        //             property: "isSelected",
        //             value: false
        //         })))
        //     } else {
        //         // Select all unselected columns in the index
        //         columns
        //             .filter(column => !column.isSelected)
        //             .forEach(column => dispatch(setColumnProperty({
        //                 column,
        //                 property: "isSelected",
        //                 value: true
        //             })))
        //     }
        // }}
        onMouseEnter={() => dispatch(hoverColumnIndex(j))}
        onMouseLeave={() => dispatch(unhoverColumnIndex())}
      >
        <label>{j + 1}</label>
      </div>
      {tables.map((table) => (
        <ColumnContainer
          key={`${table.id}-${j}`}
          tableId={table.id}
          index={j}
        />
      ))}
    </form>
  );
}
