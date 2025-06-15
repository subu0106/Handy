import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@store/store";

/**
 * Typed Redux hooks for use throughout the app.
 * Use these instead of plain `useDispatch` and `useSelector` for type safety.
 */
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
