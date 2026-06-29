import { create } from 'zustand'

export const useProjectStore = create((set, get) => ({
  projects: [],
  activeProject: null,
  importedData: null,

  setActiveProject: (project) => set({ activeProject: project }),

  addProject: (project) => set((s) => ({ projects: [...s.projects, { ...project, id: Date.now() }] })),

  setImportedData: (data) => set({ importedData: data }),

  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      activeProject: s.activeProject?.id === id ? { ...s.activeProject, ...updates } : s.activeProject,
    })),
}))
