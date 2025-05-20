/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  drawerContents: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDrawerContents(state, action) {
      state.drawerContents = action.payload;
    },
  },
});

// Action
export const { setDrawerContents } = uiSlice.actions;

export default uiSlice.reducer;
