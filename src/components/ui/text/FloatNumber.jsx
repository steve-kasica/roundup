import { format } from "d3";

const FloatNumber = ({ value, precision = 2 }) => {
  const formatValue = format(`,.${precision}f`);
  return <>{formatValue(value)}</>;
};

export default FloatNumber;
