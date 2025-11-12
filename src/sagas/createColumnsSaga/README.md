# Create Columns Saga

This saga create column metadata. It's important job is correctly linking the newly created columns to other data, e.g. parent tables/operations in Redux as well as the approprirate column within a table or view in the database. Metadata properties populated after column creation via the `updateColumnsSaga`.
