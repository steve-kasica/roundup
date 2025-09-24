/* eslint-disable react/prop-types */
/**
 * Example of using the withPaginatedRows HOC with TableView
 */
import { TableDataWrapper } from "./TableDataWrapper";

const TABLE_OBJECT = "table";
const STACK_OBJECT = "stack";
const PACK_OBJECT = "pack";

const TableView = ({ id, objectType }) => {
  if (objectType === TABLE_OBJECT) {
    return <TableDataWrapper id={id} />;
  } else if (objectType === STACK_OBJECT) {
    return <div>Stack view not implemented yet.</div>;
  } else if (objectType === PACK_OBJECT) {
    return <div>Pack view not implemented yet.</div>;
  } else {
    return <div>Unsupported object type: {objectType}</div>;
  }
};

export default TableView;
