import { create } from 'zustand'
import type { ResizerProject } from '../types'

interface ResizerStore {
  projects: ResizerProject[]
  activeProjectId: string | null
  
  createProject: (p: Pick<ResizerProject, 'name' | 'sourceImageUrl' | 'sourceProjectId' | 'sourceProjectName'>) => string
  loadProject: (id: string | null) => void
  saveProjectState: (patch: Partial<Omit<ResizerProject, 'id'>>) => void
  deleteProject: (id: string) => void
}

export const useResizerStore = create<ResizerStore>((set, get) => ({
  projects: [
    {
      id: 'rz-mock-1',
      name: 'Ramadan Promo Resizing',
      sourceProjectId: 'p1',
      sourceProjectName: 'Ramadan Promo 2026',
      sourceImageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop', // THUMBS[0]
      thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop',
      createdAt: '2026-03-14T11:00:00Z',
      lastEditedAt: '2026-03-14T11:30:00Z',
      selectedDimIds: ['meta-sq', 'meta-v1', 'goog-sq1', 'tt-v'],
      naming: { campaign: 'Ramadan', segment: 'Family', version: 'v1' },
      zipStructure: 'flat',
      editedTileImages: {}
    }
  ],
  activeProjectId: null,

  createProject: (p) => {
    const id = `rz-${Date.now()}`
    const newProj: ResizerProject = {
      ...p,
      id,
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString(),
      thumbnailUrl: p.sourceImageUrl || undefined,
      selectedDimIds: [],
      naming: { campaign: '', segment: '', version: 'v1' },
      zipStructure: 'flat',
      editedTileImages: {}
    }
    set(s => ({ projects: [newProj, ...s.projects], activeProjectId: id }))
    return id
  },

  loadProject: (id) => {
    set({ activeProjectId: id || null })
  },

  saveProjectState: (patch) => {
    const { activeProjectId } = get()
    if (!activeProjectId) return
    set(s => ({
      projects: s.projects.map(p => p.id === activeProjectId ? {
        ...p,
        ...patch,
        lastEditedAt: new Date().toISOString()
      } : p)
    }))
  },

  deleteProject: (id) => {
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId
    }))
  }
}))
