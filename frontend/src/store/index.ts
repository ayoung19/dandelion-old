import { createStore } from "redux";
import reducer, { initialState } from "./reducer";

export const store = createStore(reducer, initialState);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
