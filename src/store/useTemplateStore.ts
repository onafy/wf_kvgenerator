import { create } from 'zustand'
import type { Template, TemplateOrigin } from '../types'
import { mockTemplates } from '../mock'

interface TemplateStore {
  templates: Template[]
  activeTab: 'my' | 'team'
  searchQuery: string
  selectedTemplate: Template | null

  setActiveTab: (tab: 'my' | 'team') => void
  setSearchQuery: (q: string) => void
  selectTemplate: (t: Template | null) => void
  saveTemplate: (name: string, originTool: TemplateOrigin, thumbnailUrl: string, isPersonal: boolean) => void
  deleteTemplate: (id: string) => void
  getTemplate: (id: string) => Template | undefined
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: mockTemplates,
  activeTab: 'team',
  searchQuery: '',
  selectedTemplate: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  selectTemplate: (t) => set({ selectedTemplate: t }),

  saveTemplate: (name, originTool, thumbnailUrl, isPersonal) => {
    const newTemplate: Template = {
      id: `t-${Date.now()}`,
      name,
      originTool,
      segment: 'Retail',
      creatorId: 'u1',
      creatorName: 'Budi Santoso',
      lastUsedAt: new Date().toISOString(),
      usageCount: 0,
      thumbnailUrl,
      brandProfileVersion: 'v3',
      isPersonal,
      savedAt: new Date().toISOString(),
    }
    set((s) => ({ templates: [newTemplate, ...s.templates] }))
  },

  deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

  getTemplate: (id) => get().templates.find((t) => t.id === id),
}))
