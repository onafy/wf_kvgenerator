import { create } from 'zustand'
import type { LockedContext, DAMAsset, FunnelStage, CanvasOrientation } from '../types'

interface ContextDraft {
  projectName: string
  copy: string
  segment: string
  funnel: FunnelStage | ''
  canvasOrientation: CanvasOrientation
  artDirection: string
  assets: DAMAsset[]  // Dynamic array - no limit, no base/custom distinction
}

interface ContextStore {
  draft: ContextDraft
  locked: LockedContext | null
  editedAfterGeneration: boolean
  updateDraft: (fields: Partial<ContextDraft>) => void
  lockContext: () => void
  editLockedField: (field: keyof Pick<LockedContext, 'copy' | 'segment'>, value: string) => void
  clearContext: () => void
}

const defaultDraft: ContextDraft = {
  projectName: '',
  copy: '',
  segment: '',
  funnel: '',
  canvasOrientation: 'Portrait',
  artDirection: '',
  assets: [],  // No limit - dynamic array, no base/custom distinction
}

export const useContextStore = create<ContextStore>((set, get) => ({
  draft: defaultDraft,
  locked: null,
  editedAfterGeneration: false,

  updateDraft: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),

  lockContext: () => {
    const { draft } = get()
    // Auto-generate project name from first 4 words of copy if empty
    const autoName = draft.copy.trim().split(/\s+/).slice(0, 4).join(' ')
    const locked: LockedContext = {
      projectName: draft.projectName.trim() || autoName,
      copy: draft.copy,
      segment: draft.segment,
      funnel: (draft.funnel || 'Awareness') as FunnelStage,
      canvasOrientation: draft.canvasOrientation,
      artDirection: draft.artDirection,
      assets: draft.assets,
      brandProfileId: 'bp-cimb-v3',
      brandProfileVersion: 'v3',
      lockedAt: new Date().toISOString(),
    }
    set({ locked, editedAfterGeneration: false })
  },

  editLockedField: (field, value) => set((s) => ({
    locked: s.locked ? { ...s.locked, [field]: value } : null,
    editedAfterGeneration: true,
  })),

  clearContext: () => set({ draft: defaultDraft, locked: null, editedAfterGeneration: false }),
}))
