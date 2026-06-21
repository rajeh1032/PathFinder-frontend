import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "./store"

/** Typed `useDispatch` bound to the app's `AppDispatch`. */
export const useAppDispatch = () => useDispatch<AppDispatch>()

/** Typed `useSelector` bound to the app's `RootState`. */
export const useAppSelector = useSelector.withTypes<RootState>()
