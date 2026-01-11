import { format } from "d3";

const IntegerNumber = ({ value }) => {
  const formatValue = format(",.0f");
  return <>{formatValue(value)}</>;
};

export default IntegerNumber;
