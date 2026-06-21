import React from "react"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router"
import { Toaster } from "sonner"
import { SESSION_EXPIRED_EVENT } from "@/core/api/http.constants"
import { sessionExpired } from "@/features/auth/application/auth.slice"
import { router } from "./router"
import { store } from "./store/store"

/** Bridges the API client's 401 DOM event into the Redux store. */
function useSessionExpiryBridge() {
  React.useEffect(() => {
    const onExpire = () => store.dispatch(sessionExpired())
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpire)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpire)
  }, [])
}

function AppShell() {
  useSessionExpiryBridge()
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppShell />
    </Provider>
  )
}
