import React from "react";
import withColumnData from "../HOC/withColumnData";

const ColumnHeader = ({ column }) => {
  console.log(column);
  return (
    <>
      <strong>{column.name}</strong>
    </>
  );
};

const EnhancedColumnHeader = withColumnData(ColumnHeader);
export default EnhancedColumnHeader;
