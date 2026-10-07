"use client";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { Command, DemoData } from "./types";
import { createSeed } from "./seed";
import { applyCommand } from "./engine";
const STORAGE_KEY = "antheon:recruitment-os:v1";
type State = {
  data: DemoData;
  history: DemoData[];
  ready: boolean;
  notice: string;
  error: boolean;
  storageError: boolean;
};
type Action =
  | { type: "command"; command: Command }
  | { type: "hydrate"; data: DemoData }
  | { type: "reset" }
  | { type: "undo" }
  | { type: "notice"; message: string; error?: boolean }
  | { type: "storage-error" };
function reducer(state: State, action: Action): State {
  if (action.type === "hydrate")
    return { ...state, data: action.data, ready: true };
  if (action.type === "reset")
    return {
      data: createSeed(),
      history: [],
      ready: true,
      notice: "Demo reset to the original 7 October snapshot",
      error: false,
      storageError: false,
    };
  if (action.type === "undo") {
    const data = state.history.at(-1);
    return data
      ? {
          ...state,
          data,
          history: state.history.slice(0, -1),
          notice: "Last change undone",
          error: false,
        }
      : state;
  }
  if (action.type === "notice")
    return { ...state, notice: action.message, error: !!action.error };
  if (action.type === "storage-error") return { ...state, storageError: true };
  try {
    const result = applyCommand(state.data, action.command);
    return {
      ...state,
      data: result.data,
      history: [...state.history.slice(-4), state.data],
      notice: result.message,
      error: false,
    };
  } catch (e) {
    return {
      ...state,
      notice: e instanceof Error ? e.message : "Could not make this change",
      error: true,
    };
  }
}
function readStored(raw: string | null): DemoData | null {
  try {
    if (!raw || raw.length > 15000000) return null;
    const d = JSON.parse(raw);
    if (d.version !== 1 || !Number.isInteger(d.sequence)) return null;
    for (const key of [
      "candidates",
      "jobs",
      "placements",
      "sites",
      "clients",
      "activity",
      "notes",
      "broadcasts",
      "messages",
      "savedViews",
      "templates",
    ])
      if (!Array.isArray(d[key])) return null;
    if (
      !d.candidates.every(
        (c: DemoData["candidates"][number]) =>
          typeof c.id === "string" &&
          typeof c.name === "string" &&
          typeof c.status === "string" &&
          Array.isArray(c.qualifications) &&
          Array.isArray(c.secondary),
      )
    )
      return null;
    return d;
  } catch {
    return null;
  }
}
const Context = createContext<{
  state: State;
  run: (command: Command) => boolean;
  notify: (message: string, error?: boolean) => void;
  undo: () => void;
  reset: () => void;
} | null>(null);
export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    data: createSeed(),
    history: [],
    ready: false,
    notice: "",
    error: false,
    storageError: false,
  }));
  const first = useRef(true);
  useEffect(() => {
    let data: DemoData | null = null;
    try {
      data = readStored(localStorage.getItem(STORAGE_KEY));
    } catch {
      /* Private browsing can disable storage; continue locally. */
    }
    dispatch({ type: "hydrate", data: data ?? createSeed() });
  }, []);
  useEffect(() => {
    if (!state.ready) return;
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch {
      dispatch({ type: "storage-error" });
    }
  }, [state.data, state.ready]);
  return (
    <Context.Provider
      value={{
        state,
        run: (command) => {
          try {
            applyCommand(state.data, command);
            dispatch({ type: "command", command });
            return true;
          } catch (e) {
            dispatch({
              type: "notice",
              message: e instanceof Error ? e.message : "Check the details",
              error: true,
            });
            return false;
          }
        },
        notify: (message, error = false) =>
          dispatch({ type: "notice", message, error }),
        undo: () => dispatch({ type: "undo" }),
        reset: () => dispatch({ type: "reset" }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider missing");
  return value;
}
