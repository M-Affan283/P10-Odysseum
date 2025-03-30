import { useEffect } from 'react'
import { Routes } from './routes'
import useAdminStore from './store/adminStore'
import './App.css'

function App() {
  const { initAuth } = useAdminStore()

  useEffect(() => {
    // Initialize authentication state on app load
    initAuth()
  }, [initAuth])

  return <Routes />
}

export default App