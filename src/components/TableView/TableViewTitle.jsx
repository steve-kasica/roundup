import EditableText from "../ui/EditableText";
import withTableData from "../HOC/withTableData";

const TableViewTitle = withTableData(({ table, renameTable }) => {
  return (
    <EditableText
      initialValue={table.name}
      placeholder="Unnamed Table"
      onChange={(newValue) => {
        renameTable(table.id, newValue);
      }}
    />
  );
});

export default TableViewTitle;
