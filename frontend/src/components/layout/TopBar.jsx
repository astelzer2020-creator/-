import { useState, useRef, useEffect } from 'react'
import { Search, Bell, ChevronDown, LogOut, User as UserIcon, Settings as SettingsIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../i18n/useTranslation'
import { useAuth } from '../../hooks/useAuth'
import { Avatar, Badge } from '../ui'

const mockNotifications = [
  { id: 1, title: 'ROI calculation completed', time: '5m', read: false },
  { id: 2, title: 'New project imported', time: '1h', read: false },
  { id: 3, title: 'Report generated', time: '3h', read: true },
]

export default function TopBar({ search, onSearch }) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const notifRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = mockNotifications.filter((n) => !n.read).length

  return (
    <header className="h-16 glass border-b border-dark-600 flex items-center justify-between gap-4 px-6 shrink-0">
      <div className="relative flex-1 max-w-md">
        <Search size={16} className="absolute inset-y-0 my-auto start-3 text-text-muted" />
        <input
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={t('topbar.search')}
          className="w-full rounded-xl bg-dark-700 border border-dark-600 ps-9 pe-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-text-primary hover:bg-dark-700 transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-danger border-2 border-dark-800" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute end-0 mt-2 w-72 glass rounded-xl shadow-card overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-dark-600 text-sm font-medium text-text-primary">
                {t('topbar.notifications')}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-dark-600/50 hover:bg-dark-700/40 flex items-start gap-2">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0" />}
                    <div>
                      <p className="text-sm text-text-primary">{n.title}</p>
                      <p className="text-xs text-text-muted">{n.time} ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu((s) => !s)} className="flex items-center gap-2 p-1 rounded-xl hover:bg-dark-700 transition-colors">
            <Avatar name={user?.name} size="sm" />
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          {showMenu && (
            <div className="absolute end-0 mt-2 w-48 glass rounded-xl shadow-card overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-dark-600">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowMenu(false)
                  navigate('/settings')
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-dark-700"
              >
                <SettingsIcon size={15} /> {t('nav.settings')}
              </button>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-dark-700"
              >
                <LogOut size={15} /> {t('topbar.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
