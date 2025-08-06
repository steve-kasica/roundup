import { getDuckDB } from "./duckdbClient";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createPackView(opData) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const joinType = "JOIN";
  const query = formQuery(opData, joinType);
  console.log("Creating pack view with query:", query);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(op) {
  const table1 = op.children[0].id;
  const table2 = op.children[1].id;
  const { joinType, joinKey1, joinKey2, joinPredicate } = op.joinSpec;

  if (!joinType) {
    throw new Error("join type is unspecified");
  } else if (!joinKey1) {
    throw new Error("join key in table 1 is unspecified");
  } else if (!joinKey2) {
    throw new Error("join key in table 2 is unspecified");
  } else if (!joinPredicate) {
    throw new Error("join predicate is unspecified");
  }

  const predicates = {
    EQUALS: `${table1}.${joinKey1} = ${table2}.${joinKey2}`,
    CONTAINS: `contains(${table1}.${joinKey1}, ${table2}.${joinKey2})`,
    STARTS_WITH: `starts_with(${table1}.${joinKey1}, ${table2}.${joinKey2})`,
    ENDS_WITH: `ends_with(${table1}.${joinKey1}, ${table2}.${joinKey2})`,
  };

  const query = `
  CREATE OR REPLACE VIEW ${op.id} AS 
    SELECT *
    FROM ${table1} 
    ${joinType} JOIN 
    ${table2}
    ON ${predicates[joinPredicate]}
  `;
  return query;
}
