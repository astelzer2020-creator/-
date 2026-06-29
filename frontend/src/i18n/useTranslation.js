import { create } from 'zustand'
import he from './he'
import en from './en'

const dictionaries = { he, en }
const STORAGE_KEY = 'urc_lang'

function getInitialLang() {
  if (typeof window === 'undefined') return 'he'
  return localStorage.getItem(STORAGE_KEY) || 'he'
}

function applyDocumentDir(lang) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  document.body.dir = lang === 'he' ? 'rtl' : 'ltr'
}

export const useLanguageStore = create((set, get) => ({
  lang: getInitialLang(),
  setLang: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang)
    applyDocumentDir(lang)
    set({ lang })
  },
  toggleLang: () => {
    const next = get().lang === 'he' ? 'en' : 'he'
    get().setLang(next)
  },
}))

applyDocumentDir(getInitialLang())

function resolve(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict)
}

export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)
  const toggleLang = useLanguageStore((s) => s.toggleLang)

  const t = (key, fallback) => {
    const dict = dictionaries[lang] || dictionaries.he
    const value = resolve(dict, key)
    if (value !== undefined) return value
    const fb = resolve(dictionaries.en, key)
    return fb !== undefined ? fb : fallback || key
  }

  return { t, lang, setLang, toggleLang, isRtl: lang === 'he' }
}
