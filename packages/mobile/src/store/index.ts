import { configureStore } from "@reduxjs/toolkit";
import casesReducer from "./casesSlice";
import evidenceReducer from "./evidenceSlice";

export const store = configureStore({
  reducer: {
    cases: casesReducer,
    evidence: evidenceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
