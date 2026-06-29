import { useState } from 'react'
import { User, Globe, Moon, Sun, Bell, Database } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/useTranslation'
import { CITY_PRICES, CITY_NAMES } from '../data/cityPrices'
import { Card, Button, Input, Divider } from '../components/ui'
import PageHeader from '../components/layout/PageHeader'

export default function Settings() {
  const { user } = useAuth()
  const { t, lang, setLang } = useTranslation()
  const [profile, setProfile] = useState({ name: user?.name || '', company: user?.company || '', email: user?.email || '' })
  const [darkMode, setDarkMode] = useState(localStorage.getItem('urc_theme') !== 'light')
  const [notif, setNotif] = useState({ email: true, reports: true, updates: false })

  const handleSaveProfile = () => {
    toast.success(t('common.save'))
  }

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('urc_theme', next ? 'dark' : 'light')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title={t('settings.title')} breadcrumb={[{ label: t('nav.dashboard'), to: '/dashboard' }, { label: t('settings.title') }]} />

      <Card header={<div className="flex items-center gap-2 text-text-primary font-semibold"><User size={16} /> {t('settings.profile')}</div>}>
        <div className="space-y-4">
          <Input label={t('auth.name')} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          <Input label={t('auth.email')} type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
          <Input label={t('auth.company')} value={profile.company} onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))} />
          <Button onClick={handleSaveProfile}>{t('common.save')}</Button>
        </div>
      </Card>

      <Card header={<div className="flex items-center gap-2 text-text-primary font-semibold"><Globe size={16} /> {t('settings.language')}</div>}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang('he')}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${lang === 'he' ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-dark-600 text-text-muted hover:border-brand-primary/50'}`}
          >
            עברית (RTL)
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${lang === 'en' ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-dark-600 text-text-muted hover:border-brand-primary/50'}`}
          >
            English (LTR)
          </button>
        </div>
      </Card>

      <Card header={<div className="flex items-center gap-2 text-text-primary font-semibold"><Moon size={16} /> {t('settings.theme')}</div>}>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${darkMode ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-dark-600 text-text-muted'}`}
          >
            <Moon size={16} /> {t('settings.dark')}
          </button>
          <button
            onClick={toggleDark}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${!darkMode ? 'border-brand-primary bg-brand-primary/15 text-brand-primary' : 'border-dark-600 text-text-muted'}`}
          >
            <Sun size={16} /> {t('settings.light')}
          </button>
        </div>
      </Card>

      <Card header={<div className="flex items-center gap-2 text-text-primary font-semibold"><Bell size={16} /> {t('settings.notifications')}</div>}>
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Email notifications' },
            { key: 'reports', label: 'Report generation alerts' },
            { key: 'updates', label: 'Platform updates' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-text-primary">{label}</span>
              <button
                onClick={() => setNotif((n) => ({ ...n, [key]: !n[key] }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${notif[key] ? 'bg-brand-primary' : 'bg-dark-500'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${notif[key] ? 'start-5' : 'start-0.5'}`} />
              </button>
            </label>
          ))}
        </div>
      </Card>

      <Card header={<div className="flex items-center gap-2 text-text-primary font-semibold"><Database size={16} /> {t('settings.cityPrices')}</div>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-muted border-b border-dark-600">
                <th className="text-start py-2">עיר</th>
                <th className="text-start py-2">{'מחיר קרקע (₪/מ"ר)'}</th>
                <th className="text-start py-2">{'מחיר מכירה (₪/מ"ר)'}</th>
                <th className="text-start py-2">{'עלות בנייה (₪/מ"ר)'}</th>
              </tr>
            </thead>
            <tbody>
              {CITY_NAMES.map((city) => {
                const p = CITY_PRICES[city]
                return (
                  <tr key={city} className="border-t border-dark-600">
                    <td className="py-2 text-text-primary font-medium">{city}</td>
                    <td className="py-2 text-text-muted">{p.land.toLocaleString()}</td>
                    <td className="py-2 text-text-muted">{p.sale.toLocaleString()}</td>
                    <td className="py-2 text-text-muted">{p.build.toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
