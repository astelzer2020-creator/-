import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'urban_renewal_projects'

export const useProjectStore = create((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) set({ projects: JSON.parse(raw) })
    } catch {}
  },

  save: async (projects) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  },

  addProject: (project) => {
    const updated = [...get().projects, { ...project, id: Date.now() }]
    set({ projects: updated })
    get().save(updated)
  },

  addBulk: (items) => {
    const updated = [
      ...get().projects,
      ...items.map((p, i) => ({ ...p, id: Date.now() + i })),
    ]
    set({ projects: updated })
    get().save(updated)
  },

  removeProject: (id) => {
    const updated = get().projects.filter((p) => p.id !== id)
    set({ projects: updated })
    get().save(updated)
  },

  updateProject: (id, patch) => {
    const updated = get().projects.map((p) => p.id === id ? { ...p, ...patch } : p)
    set({ projects: updated })
    get().save(updated)
  },

  clear: () => {
    set({ projects: [] })
    AsyncStorage.removeItem(STORAGE_KEY)
  },
}))
