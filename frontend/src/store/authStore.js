import { create } from 'zustand'

const STORAGE_KEY = 'urc_auth'
const USERS_KEY = 'urc_users'

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null
  } catch {
    return null
  }
}

export const useAuthStore = create((set, get) => ({
  user: loadSession(),
  error: null,
  loading: false,

  login: async ({ email, password, remember }) => {
    set({ loading: true, error: null })
    await new Promise((r) => setTimeout(r, 400))
    const users = loadUsers()
    const found = users.find((u) => u.email === email && u.password === password)
    if (!found) {
      const fallbackDemo = email === 'demo@urc.app' && password === 'demo1234'
      if (!fallbackDemo) {
        set({ loading: false, error: 'invalid' })
        return false
      }
    }
    const user = found || { name: 'Demo User', email, company: 'Demo Co.' }
    const session = { name: user.name, email: user.email, company: user.company }
    if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    set({ user: session, loading: false, error: null })
    return true
  },

  register: async ({ name, email, password, company }) => {
    set({ loading: true, error: null })
    await new Promise((r) => setTimeout(r, 400))
    const users = loadUsers()
    if (users.some((u) => u.email === email)) {
      set({ loading: false, error: 'exists' })
      return false
    }
    const user = { name, email, password, company }
    saveUsers([...users, user])
    const session = { name, email, company }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    set({ user: session, loading: false, error: null })
    return true
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null })
  },
}))
