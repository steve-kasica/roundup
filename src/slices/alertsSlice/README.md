# Alerts Slice

Unlike other objects stored in slice, alerts slices are not guaranteed to be unique. We assume that the kinds of errors we define can only have a one-to-one correspondence between that type of errro and the objects. Therefore, the IDs for alert instances are dependent upon the unique identifier for the object (column, table, or operation) and the type of alert being raised, e.g. Incongruent tables, missing join key, etc..
