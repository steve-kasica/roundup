import { getDuckDB } from "./duckdbClient";

export async function getColumnStats(tableId, columnList) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const columnsClause = columnList ? columnList.join(", ") : "*";
  // If columnList is provided, use it in the query; otherwise, select all columns
  // This allows for summarizing specific columns or the entire table
  const query = `SUMMARIZE SELECT ${columnsClause} FROM ${tableId};`;
  const response = await conn.query(query);

  // Get top 10 most frequent values and their counts for each column
  const columns =
    columnList ||
    (await conn.query(`SELECT * FROM ${tableId} LIMIT 0`)).schema.fields.map(
      (f) => f.name
    );
  const topValuesQueries = columns.map(
    (col) =>
      `SELECT '${col}' as column_name, ${col} as value, COUNT(*) as count 
     FROM ${tableId} 
     WHERE ${col} IS NOT NULL 
     GROUP BY ${col} 
     ORDER BY COUNT(*) DESC 
     LIMIT 10`
  );
  const topValuesQuery = topValuesQueries.join(" UNION ALL ");
  const topValuesResponse = await conn.query(topValuesQuery);
  const topValuesResults = topValuesResponse.toArray().reduce((acc, row) => {
    const rowData = row.toJSON();
    const columnName = rowData.column_name;

    if (!acc[columnName]) {
      acc[columnName] = [];
    }

    acc[columnName].push({
      value: rowData.value,
      count: Number(rowData.count),
    });

    return acc;
  }, {});
  await conn.close();
  const result = response.toArray().map((proxyStruct) => {
    const jsonData = proxyStruct.toJSON();

    // Serialize all values to regular JavaScript types
    const serialized = {};
    for (const [key, value] of Object.entries(jsonData)) {
      if (value === null || value === undefined) {
        serialized[key] = value;
      } else if (typeof value === "bigint") {
        // Handle BigInt values (e.g., 328n)
        serialized[key] = Number(value);
      } else if (typeof value === "object" && value.valueOf) {
        // Handle BigInt and other wrapper objects
        serialized[key] = value.valueOf();
      } else if (
        value instanceof Uint32Array ||
        value instanceof Int32Array ||
        value instanceof Float32Array ||
        value instanceof Float64Array ||
        value instanceof BigInt64Array ||
        value instanceof BigUint64Array
      ) {
        // Handle typed arrays - convert to regular number
        serialized[key] = Number(value[0] || value);
      } else if (typeof value === "string") {
        // Handle string representation of BigInt (e.g., "328n")
        if (value.endsWith("n") && !isNaN(Number(value.slice(0, -1)))) {
          serialized[key] = Number(value.slice(0, -1));
        } else {
          // Try to parse other numeric strings
          const numValue = Number(value);
          serialized[key] = isNaN(numValue) ? value : numValue;
        }
      } else if (
        (typeof value === "object" &&
          typeof value.constructor !== "undefined" &&
          value.constructor.name.includes("UInt32")) ||
        value.constructor.name.includes("Int32") ||
        value.constructor.name.includes("Float")
      ) {
        // Handle other numeric wrapper types by converting to number
        serialized[key] = Number(value);
      } else {
        serialized[key] = value;
      }
    }

    // Get the top 10 most frequent values for this column
    const columnName = serialized.column_name;
    const topValues = topValuesResults[columnName] || [];
    const modeData = topValues[0] || { value: null, count: null };

    return {
      approxUnique: serialized.approx_unique,
      avg: serialized.avg,
      columnType: serialized.column_type,
      count: serialized.count,
      max: serialized.max,
      min: serialized.min,
      nullPercentage: serialized.null_percentage / 10000, // This is in basis points (e.g., 2500 = 25.00%)
      p25: serialized.p25,
      p50: serialized.p50,
      p75: serialized.p75,
      std: serialized.std,
      modeValue: modeData.value,
      modeCount: modeData.count,
      topValues: topValues,
    };
  });

  return result;
}
