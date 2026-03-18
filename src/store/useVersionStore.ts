import { create } from 'zustand'
import type { Version, VersionAction } from '../types'
import { mockVersions } from '../mock'

interface VersionStore {
  versions: Record<string, Version[]>
  addVersion: (projectId: string, opts: { thumbnailUrl: string; action: VersionAction; promptSummary: string; createdBy: string; isPreviousContext?: boolean }) => void
  getVersions: (projectId: string) => Version[]
}

export const useVersionStore = create<VersionStore>((set, get) => ({
  versions: mockVersions,

  addVersion: (projectId, opts) => {
    const existing = get().versions[projectId] || []
    const newVersion: Version = {
      id: `ver-${Date.now()}`,
      projectId,
      versionNumber: existing.length + 1,
      thumbnailUrl: opts.thumbnailUrl,
      action: opts.action,
      promptSummary: opts.promptSummary,
      createdAt: new Date().toISOString(),
      createdBy: opts.createdBy,
      isGeneratedWithPreviousContext: opts.isPreviousContext || false,
    }
    set((s) => ({ versions: { ...s.versions, [projectId]: [...existing, newVersion] } }))
  },

  getVersions: (projectId) => get().versions[projectId] || [],
}))
