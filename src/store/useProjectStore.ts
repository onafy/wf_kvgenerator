import { create } from 'zustand'
import type { Project, ProjectStatus } from '../types'
import { mockProjects } from '../mock'

interface Filters {
  status: string
  segment: string
  funnel: string
  creator: string
  search: string
}

interface ProjectStore {
  projects: Project[]
  filters: Filters
  setFilters: (f: Partial<Filters>) => void
  createProject: (p: Omit<Project, 'id' | 'lastModifiedAt'>) => Project
  updateProjectStatus: (id: string, status: ProjectStatus) => void
  updateProjectThumbnail: (id: string, url: string) => void
  duplicateProject: (id: string) => void
  deleteProject: (id: string) => void
  getProject: (id: string) => Project | undefined
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: mockProjects,
  filters: { status: '', segment: '', funnel: '', creator: '', search: '' },

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),

  createProject: (p) => {
    const project: Project = { ...p, id: `p-${Date.now()}`, lastModifiedAt: new Date().toISOString() }
    set((s) => ({ projects: [project, ...s.projects] }))
    return project
  },

  updateProjectStatus: (id, status) => set((s) => ({
    projects: s.projects.map((p) => p.id === id ? { ...p, status, lastModifiedAt: new Date().toISOString() } : p)
  })),

  updateProjectThumbnail: (id, url) => set((s) => ({
    projects: s.projects.map((p) => p.id === id ? { ...p, thumbnailUrl: url } : p)
  })),

  duplicateProject: (id) => {
    const original = get().projects.find((p) => p.id === id)
    if (!original) return
    const copy: Project = { ...original, id: `p-${Date.now()}`, name: `${original.name} (Copy)`, status: 'Draft', lastModifiedAt: new Date().toISOString() }
    set((s) => ({ projects: [copy, ...s.projects] }))
  },

  deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  getProject: (id) => get().projects.find((p) => p.id === id),
}))

export function useFilteredProjects() {
  const { projects, filters } = useProjectStore()
  return projects.filter((p) => {
    if (filters.status && p.status !== filters.status) return false
    if (filters.segment && p.segment !== filters.segment) return false
    if (filters.funnel && p.funnel !== filters.funnel) return false
    if (filters.creator && p.creatorName !== filters.creator) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.segment.toLowerCase().includes(q)) return false
    }
    return true
  })
}
