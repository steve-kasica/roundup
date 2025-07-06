export const selectValuesById = (state, ids) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }
  return ids.map((id) => state.values.data[id]).filter(Boolean);
};
