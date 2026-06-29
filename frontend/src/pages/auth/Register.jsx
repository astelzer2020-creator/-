import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, User, Briefcase, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { useTranslation } from '../../i18n/useTranslation'
import { Button, Input } from '../../components/ui'

export default function Register() {
  const { t } = useTranslation()
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', company: '' })
  const [error, setError] = useState('')

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError(t('auth.confirmPassword'))
      return
    }
    const ok = await register(form)
    if (ok) {
      toast.success(t('auth.createAccount'))
      navigate('/dashboard', { replace: true })
    } else {
      setError('Email already registered')
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

        <h2 className="text-2xl font-bold text-text-primary mb-1">{t('auth.createAccount')}</h2>
        <p className="text-sm text-text-muted mb-6">{t('auth.registerSubtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('auth.name')} icon={User} value={form.name} onChange={update('name')} required />
          <Input label={t('auth.email')} type="email" icon={Mail} value={form.email} onChange={update('email')} required />
          <Input
            label={`${t('auth.company')} (${t('common.optional')})`}
            icon={Briefcase}
            value={form.company}
            onChange={update('company')}
          />
          <Input label={t('auth.password')} type="password" icon={Lock} value={form.password} onChange={update('password')} required />
          <Input
            label={t('auth.confirmPassword')}
            type="password"
            icon={Lock}
            value={form.confirm}
            onChange={update('confirm')}
            required
          />
          {error && <p className="text-xs text-danger">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" icon={ArrowRight}>
            {t('auth.createAccount')}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-brand-accent hover:underline font-medium">
            {t('auth.signIn')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
