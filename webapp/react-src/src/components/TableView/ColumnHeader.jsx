import withColumnData from "../HOC/withColumnData";

function ColumnHeader({ name, isLoading }) {
  if (isLoading) {
    return <th className="column-header loading">Loading...</th>;
  } else {
    return <th className="column-header">{name}</th>;
  }
}

const EnhancedComponent = withColumnData(ColumnHeader);
export default EnhancedComponent;
