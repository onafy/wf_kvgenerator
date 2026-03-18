import { create } from 'zustand'
import type { BoundingBox, CanvasElement } from '../types'

type ActiveTool = 'bbox' | 'overlay' | 'move' | null

interface EditorStore {
  activeVariantId: string | null
  activeProjectId: string | null
  activeTool: ActiveTool
  activeBBoxId: string | null
  boundingBoxes: BoundingBox[]
  elements: CanvasElement[]
  zoom: number

  setActiveVariant: (variantId: string, projectId: string) => void
  setActiveTool: (tool: ActiveTool) => void
  addBoundingBox: (bbox: Omit<BoundingBox, 'id' | 'isActive' | 'prompt'>) => string
  updateBBoxPrompt: (id: string, prompt: string) => void
  removeBoundingBox: (id: string) => void
  setActiveBBox: (id: string | null) => void
  toggleElementScope: (id: string) => void
  setZoom: (z: number) => void
  resetEditor: () => void
  initDefaultElements: () => void
}

const defaultElements: CanvasElement[] = [
  { id: 'el-bg', label: 'Background / Imagery', type: 'Dynamic', regenScope: 'Regenerate' },
  { id: 'el-logo', label: 'CIMB Logo', type: 'Static', assetUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/CIMB_Group_logo.svg/200px-CIMB_Group_logo.svg.png', regenScope: 'Preserve' },
  { id: 'el-copy', label: 'Campaign Copy', type: 'Dynamic', regenScope: 'Regenerate' },
  { id: 'el-cta', label: 'CTA Button', type: 'Static', regenScope: 'Preserve' },
]

export const useEditorStore = create<EditorStore>((set) => ({
  activeVariantId: null,
  activeProjectId: null,
  activeTool: null,
  activeBBoxId: null,
  boundingBoxes: [],
  elements: defaultElements,
  zoom: 1,

  setActiveVariant: (variantId, projectId) => set({ activeVariantId: variantId, activeProjectId: projectId, boundingBoxes: [], elements: defaultElements }),

  setActiveTool: (tool) => set({ activeTool: tool, activeBBoxId: null }),

  addBoundingBox: (bbox) => {
    const id = `bbox-${Date.now()}`
    const newBBox: BoundingBox = { ...bbox, id, prompt: '', isActive: true }
    set((s) => ({
      boundingBoxes: s.boundingBoxes.map((b) => ({ ...b, isActive: false })).concat(newBBox),
      activeBBoxId: id,
    }))
    return id
  },

  updateBBoxPrompt: (id, prompt) => set((s) => ({
    boundingBoxes: s.boundingBoxes.map((b) => b.id === id ? { ...b, prompt } : b)
  })),

  removeBoundingBox: (id) => set((s) => ({
    boundingBoxes: s.boundingBoxes.filter((b) => b.id !== id),
    activeBBoxId: s.activeBBoxId === id ? null : s.activeBBoxId,
  })),

  setActiveBBox: (id) => set((s) => ({
    activeBBoxId: id,
    boundingBoxes: s.boundingBoxes.map((b) => ({ ...b, isActive: b.id === id })),
  })),

  toggleElementScope: (id) => set((s) => ({
    elements: s.elements.map((el) => el.id === id && el.type === 'Dynamic'
      ? { ...el, regenScope: el.regenScope === 'Regenerate' ? 'Preserve' : 'Regenerate' }
      : el
    )
  })),

  setZoom: (zoom) => set({ zoom }),

  resetEditor: () => set({ activeVariantId: null, activeProjectId: null, activeTool: null, boundingBoxes: [], elements: defaultElements }),

  initDefaultElements: () => set({ elements: defaultElements }),
}))
