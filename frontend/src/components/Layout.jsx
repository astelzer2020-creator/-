import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, Calculator, Box, Map, FileText, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'לוח בקרה' },
  { to: '/import', icon: Upload, label: 'יבוא נתונים' },
  { to: '/roi', icon: Calculator, label: 'מחשבון ROI' },
  { to: '/3d', icon: Box, label: 'תצוגה תלת-מימד' },
  { to: '/map', icon: Map, label: 'מפה' },
  { to: '/reports', icon: FileText, label: 'דוחות' },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 glass border-r border-slate-700/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Building2 size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">התחדשות עירונית</h1>
              <p className="text-xs text-slate-400">סימולטור ישראלי</p>
            </div>
          </div>
        </div>
        <nav className="p-4 flex-1 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <div className="glass rounded-xl p-3 text-xs text-slate-400 text-center">
            <p className="font-medium text-slate-300">גרסה 1.0.0</p>
            <p className="mt-1">תמ"א 38 | פינוי-בינוי</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-slate-900">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
