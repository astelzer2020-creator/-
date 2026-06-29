import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_PROJECTS } from '../data/mockProjects'

export const useProjectStore = create(
  persist(
    (set, get) => ({
      projects: MOCK_PROJECTS,
      activeProject: null,
      importedData: null,
      scenarios: [],

      setActiveProject: (project) => set({ activeProject: project }),

      addProject: (project) =>
        set((s) => ({ projects: [{ ...project, id: Date.now(), createdAt: new Date().toISOString() }, ...s.projects] })),

      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      setImportedData: (data) => set({ importedData: data }),

      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          activeProject: s.activeProject?.id === id ? { ...s.activeProject, ...updates } : s.activeProject,
        })),

      saveScenario: (scenario) =>
        set((s) => ({
          scenarios: [...s.scenarios, { ...scenario, id: Date.now() }].slice(-3),
        })),

      removeScenario: (id) =>
        set((s) => ({ scenarios: s.scenarios.filter((sc) => sc.id !== id) })),

      resetMockData: () => set({ projects: MOCK_PROJECTS }),
    }),
    { name: 'urc_projects' }
  )
)
