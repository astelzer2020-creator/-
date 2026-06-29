import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../i18n/useTranslation'
import { Button, Input } from '../../components/ui'

export default function Login() {
  const { t, isRtl } = useTranslation()
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('demo@urc.app')
  const [password, setPassword] = useState('demo1234')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const ok = await login({ email, password, remember })
    if (ok) {
      toast.success(t('auth.welcomeBack'))
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } else {
      setError(t('auth.invalidCredentials'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md glass rounded-2xl p-8 shadow-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-brand-primary rounded-xl shadow-glow">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-text-primary">{t('app.name')}</h1>
            <p className="text-xs text-text-muted">{t('app.tagline')}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-1">{t('auth.welcomeBack')}</h2>
        <p className="text-sm text-text-muted mb-6">{t('auth.loginSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.email')}
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={t('auth.password')}
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded accent-brand-primary"
              />
              {t('auth.rememberMe')}
            </label>
            <Link to="/forgot-password" className="text-brand-accent hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full" icon={ArrowRight}>
            {t('auth.signIn')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-brand-accent hover:underline font-medium">
            {t('auth.createAccount')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
