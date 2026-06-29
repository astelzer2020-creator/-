import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Calculator,
  Map,
  Upload,
  FileText,
  Settings as SettingsIcon,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  Moon,
  Sun,
  Languages,
  Box,
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
import { useTranslation } from '../../i18n/useTranslation'
import { useAuth } from '../../hooks/useAuth'
import { Avatar, Tooltip } from '../ui'

export default function Sidebar({ collapsed, onToggle, darkMode, onToggleDark }) {
  const { t, toggleLang, lang } = useTranslation()
  const { user } = useAuth()

  const nav = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/projects', icon: FolderKanban, label: t('nav.projects') },
    { to: '/roi', icon: Calculator, label: t('nav.roi') },
    { to: '/map', icon: Map, label: t('nav.map') },
    { to: '/import', icon: Upload, label: t('nav.import') },
    { to: '/3d', icon: Box, label: t('nav.visualization3d') },
    { to: '/reports', icon: FileText, label: t('nav.reports') },
    { to: '/settings', icon: SettingsIcon, label: t('nav.settings') },
  ]

  return (
    <aside
      className={clsx(
        'glass border-e border-dark-600 flex flex-col shrink-0 transition-all duration-200',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-5 border-b border-dark-600 flex items-center gap-3">
        <div className="p-2 bg-brand-primary rounded-xl shadow-glow shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-text-primary truncate">{t('app.name')}</h1>
            <p className="text-xs text-text-muted truncate">{t('app.tagline')}</p>
          </div>
        )}
      </div>

      <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
        {nav.map(({ to, icon: Icon, label }) => {
          const item = (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-primary text-white shadow-glow'
                    : 'text-slate-400 hover:text-text-primary hover:bg-dark-700'
                )
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          )
          return collapsed ? (
            <Tooltip key={to} content={label} position="end">
              {item}
            </Tooltip>
          ) : (
            item
          )
        })}
      </nav>

      <div className="p-3 border-t border-dark-600 space-y-2">
        <div className={clsx('flex items-center gap-2', collapsed ? 'justify-center' : 'justify-between px-1')}>
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg text-slate-400 hover:text-text-primary hover:bg-dark-700 transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={toggleLang}
            className="p-2 rounded-lg text-slate-400 hover:text-text-primary hover:bg-dark-700 transition-colors flex items-center gap-1"
            title="Toggle language"
          >
            <Languages size={16} />
            {!collapsed && <span className="text-xs">{lang === 'he' ? 'EN' : 'עב'}</span>}
          </button>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-400 hover:text-text-primary hover:bg-dark-700 transition-colors"
          >
            {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-dark-700/50">
            <Avatar name={user.name} size="sm" />
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
