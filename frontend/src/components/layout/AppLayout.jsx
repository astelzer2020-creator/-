import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('urc_theme') !== 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('urc_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar search={search} onSearch={setSearch} />
        <main className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
