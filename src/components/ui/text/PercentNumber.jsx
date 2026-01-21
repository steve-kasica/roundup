import { format } from "d3";

/**
 * Displays a number as a percentage with a specified precision.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {number} props.value - The numeric value to format as a percentage.
 * @param {number} [props.precision=2] - Number of decimal places to display.
 * @returns {JSX.Element} The formatted percentage value.
 */
const PercentNumber = ({ value, precision = 2 }) => {
  const formatValue = format(`.${precision}%`);
  return <>{formatValue(value)}</>;
};

export default PercentNumber;
