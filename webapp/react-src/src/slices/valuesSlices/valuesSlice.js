import { createSlice } from "@reduxjs/toolkit";
import Value, { isValue } from "./Value";

const initialState = {
  ids: [],
  data: {},
};
const valuesSlice = createSlice({
  name: "values",
  initialState,
  reducers: {
    addValues(state, action) {
      let values = action.payload;
      if (!Array.isArray(values)) {
        values = [values];
      }
      values.forEach((value) => {
        if (!isValue(value)) {
          throw Error("Invalid value type. Expected an instance of Value.");
        } else if (!state.ids.includes(value.id)) {
          // Only add if the value is not already present
          // This prevents duplicates in the state
          state.ids.push(value.id);
          state.data[value.id] = value;
        }
      });
    },
    removeValue(state, action) {
      const id = action.payload;
      if (state.data[id]) {
        delete state.data[id];
        state.ids = state.ids.filter((valueId) => valueId !== id);
      } else {
        throw Error(`Value with id ${id} does not exist.`);
      }
    },
    clearData(state) {
      state.data = initialState.data;
      state.ids = initialState.ids;
    },
  },
});

export const { addValues, removeValues, clearData } = valuesSlice.actions;
export default valuesSlice.reducer;
