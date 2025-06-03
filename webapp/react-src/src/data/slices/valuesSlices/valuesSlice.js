import { createSlice } from "@reduxjs/toolkit";
import Value, { isValue } from "./Value";

const initialState = {
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
        if (isValue(value)) {
          state.data[value.id] = value;
        } else {
          throw Error("Invalid value type. Expected an instance of Value.");
        }
      });
    },
    removeValue(state, action) {
      const id = action.payload;
      if (state.data[id]) {
        delete state.data[id];
      } else {
        console.warn(`Value with id ${id} does not exist.`);
      }
    },
    clearData(state) {
      state.data = initialState.data;
    },
  },
});

export const { addValues, removeValues, clearData } = valuesSlice.actions;
export default valuesSlice.reducer;
