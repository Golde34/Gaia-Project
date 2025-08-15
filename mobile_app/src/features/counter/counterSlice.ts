// src/features/counter/counterSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state: { value: number; }) => {
      state.value += 1;
    },
    decrement: (state: { value: number; }) => {
      state.value -= 1;
    },
    reset: (state: { value: number; }) => {
      state.value = 0;
    },
  },
});

export const { increment, decrement, reset } = counterSlice.actions;
export default counterSlice.reducer;
