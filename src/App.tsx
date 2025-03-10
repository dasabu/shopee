import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useRoutesElements from './hooks/useRoutesElements'
import { LocalStorageEventTarget } from './utils/auth'
import { useContext, useEffect } from 'react'
import { AppContext } from './contexts/app.context'
import { CLEAR_LS_EVENT } from './utils/constants'

function App() {
  const routeElements = useRoutesElements()

  const { reset } = useContext(AppContext)
  useEffect(() => {
    LocalStorageEventTarget.addEventListener(CLEAR_LS_EVENT, reset)
    // clear event when component is unmounted -> avoid memory leak
    return () => {
      LocalStorageEventTarget.removeEventListener(CLEAR_LS_EVENT, reset)
    }
  }, [reset])

  return (
    <>
      {routeElements}
      <ToastContainer />
    </>
  )
}

export default App
