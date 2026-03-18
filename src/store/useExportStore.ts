import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShareLink, ExportRecord, NamingConvention } from '../types'
import { mockShareLinks } from '../mock'

interface ExportStore {
  naming: NamingConvention
  zipStructure: 'flat' | 'grouped'
  shareLinks: ShareLink[]
  exportHistory: ExportRecord[]
  isExporting: boolean

  // Persisted resize selection — survives navigation to Image Editor and back
  selectedDimIds: string[]
  setSelectedDimIds: (ids: string[]) => void

  // Per-tile edited images — keyed by dimensionId, set when user returns from Image Editor
  editedTileImages: Record<string, string>
  setEditedTileImage: (dimId: string, url: string) => void

  setNamingField: (field: keyof NamingConvention, value: string) => void
  setZipStructure: (mode: 'flat' | 'grouped') => void
  generateShareLink: (variantId: string, projectId: string, expiryDays: number, imageUrl?: string) => ShareLink
  revokeShareLink: (token: string) => void
  startExport: () => void
  finishExport: (projectId: string) => void
  getLinkByToken: (token: string) => ShareLink | undefined
}

function addDays(d: Date, days: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + days)
  return r
}

export const useExportStore = create<ExportStore>()(
  persist(
    (set, get) => ({
      naming: { campaign: '', segment: '', version: 'v1' },
      zipStructure: 'flat',
      shareLinks: mockShareLinks,
      exportHistory: [],
      isExporting: false,
      selectedDimIds: [],
      editedTileImages: {},

      setSelectedDimIds: (ids) => set({ selectedDimIds: ids }),
      setEditedTileImage: (dimId, url) => set((s) => ({ editedTileImages: { ...s.editedTileImages, [dimId]: url } })),

      setNamingField: (field, value) => set((s) => ({ naming: { ...s.naming, [field]: value } })),
      setZipStructure: (mode) => set({ zipStructure: mode }),

      generateShareLink: (variantId, projectId, expiryDays, imageUrl) => {
        const link: ShareLink = {
          id: `sl-${Date.now()}`,
          token: `share-${Math.random().toString(36).slice(2, 14)}`,
          variantId,
          projectId,
          createdAt: new Date().toISOString(),
          expiresAt: addDays(new Date(), expiryDays).toISOString(),
          isRevoked: false,
          imageUrl,
        }
        set((s) => ({ shareLinks: [link, ...s.shareLinks] }))
        return link
      },

      revokeShareLink: (token) => set((s) => ({
        shareLinks: s.shareLinks.map((l) => l.token === token ? { ...l, isRevoked: true } : l)
      })),

      startExport: () => set({ isExporting: true }),

      finishExport: (projectId) => {
        const record: ExportRecord = {
          id: `exp-${Date.now()}`,
          projectId,
          exportedAt: new Date().toISOString(),
          fileCount: 6,
          downloadUrl: '#',
        }
        set((s) => ({ isExporting: false, exportHistory: [record, ...s.exportHistory] }))
      },

      getLinkByToken: (token) => get().shareLinks.find((l) => l.token === token),
    }),
    {
      name: 'export-storage'
    }
  )
)
