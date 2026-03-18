import { create } from 'zustand'

// ── Instruction types ──────────────────────────────────────────────
export type InstructionType = 'InPaint' | 'Text' | 'Erase' | 'AssetOverlay'
export type InstructionStatus = 'Staged' | 'Executed'
export type MaskShape = 'rectangle' | 'ellipse' | 'polygon' | 'freehand'

export interface MaskRegion {
  shape: MaskShape
  x: number
  y: number
  width: number
  height: number
}

export interface Instruction {
  id: string
  type: InstructionType
  label: string
  prompt: string          // main prompt / blend instruction / style prompt
  content?: string        // for Text: the actual text content
  fillHint?: string       // for Erase: optional fill hint
  mask?: MaskRegion       // for InPaint / Erase
  assetUrl?: string       // for AssetOverlay
  isStatic?: boolean      // for AssetOverlay
  status: InstructionStatus
  createdAt: string
}

// ── Version history ────────────────────────────────────────────────
export interface ImageEditorVersion {
  id: string
  versionNumber: number
  thumbnailUrl: string
  instructionSummary: string
  createdAt: string
}

// ── Session state ──────────────────────────────────────────────────
export interface ImageEditorSession {
  sourceImageUrl: string | null
  brandEnabled: boolean
  versions: ImageEditorVersion[]
  currentVersionIdx: number
}

import type { ImageEditorProject } from '../types'

interface ImageEditorStore {
  // Projects
  projects: ImageEditorProject[]
  activeProjectId: string | null
  createProject: (p: Pick<ImageEditorProject, 'name'|'sourceImageUrl'|'brandEnabled'> & Partial<ImageEditorProject>) => string
  loadProject: (id: string | null) => void
  saveProject: () => void

  // Session
  session: ImageEditorSession
  setSourceImage: (url: string) => void
  enableBrand: () => void
  skipBrand: () => void

  // Return-to context (set by calling tool when handing off)
  returnTo: { path: string; label: string; dimId?: string } | null
  setReturnTo: (ctx: { path: string; label: string; dimId?: string } | null) => void

  // Active tool
  activeTool: MaskShape | 'automask' | 'text' | 'erase' | 'overlay' | 'move' | null
  setActiveTool: (t: ImageEditorStore['activeTool']) => void

  // Drawing state (in-progress mask being drawn)
  drawingMask: MaskRegion | null
  setDrawingMask: (m: MaskRegion | null) => void

  // Staged masks on canvas (visual only, linked to instruction by id)
  canvasMasks: (MaskRegion & { instructionId: string; shape: MaskShape })[]
  addCanvasMask: (mask: MaskRegion & { instructionId: string; shape: MaskShape }) => void
  removeCanvasMask: (instructionId: string) => void

  // Instruction Queue
  instructions: Instruction[]
  activeInstructionId: string | null
  addInstruction: (instr: Omit<Instruction, 'id' | 'status' | 'createdAt'>) => string
  updateInstruction: (id: string, patch: Partial<Omit<Instruction, 'id'>>) => void
  removeInstruction: (id: string) => void
  reorderInstruction: (fromIdx: number, toIdx: number) => void
  clearStaged: () => void
  setActiveInstruction: (id: string | null) => void

  // Regeneration
  isRegenerating: boolean
  regenProgress: number
  startRegen: () => void
  tickRegen: (p: number) => void
  completeRegen: (thumbnailUrl: string, summary: string) => void
  failRegen: () => void

  // Export
  isExporting: boolean
  setExporting: (v: boolean) => void

  // Reset session
  resetSession: () => void
}

const defaultSession: ImageEditorSession = {
  sourceImageUrl: null,
  brandEnabled: false,
  versions: [],
  currentVersionIdx: -1,
}

export const useImageEditorStore = create<ImageEditorStore>((set, get) => ({
  projects: [
    {
      id: 'ie-mock-1',
      name: 'Ramadan Promo Retouch',
      sourceProjectId: 'p1',
      sourceProjectName: 'Ramadan Promo 2026',
      sourceImageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop', // THUMBS[0]
      brandEnabled: true,
      createdAt: '2026-03-14T10:15:00Z',
      lastEditedAt: '2026-03-14T10:25:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop'
    },
    {
      id: 'ie-mock-2',
      name: 'Hari Raya Tone Fix',
      sourceProjectId: 'p2',
      sourceProjectName: 'Hari Raya Sale',
      sourceImageUrl: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=400&h=400&fit=crop', // THUMBS[3]
      brandEnabled: true,
      createdAt: '2026-03-13T14:15:00Z',
      lastEditedAt: '2026-03-13T14:35:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop' // THUMBS[1]
    }
  ],
  activeProjectId: null,

  session: defaultSession,
  activeTool: null,
  drawingMask: null,
  canvasMasks: [],
  instructions: [],
  activeInstructionId: null,
  isRegenerating: false,
  regenProgress: 0,
  isExporting: false,
  returnTo: null,

  createProject: (p) => {
    const id = `ie-${Date.now()}`
    const startUrl = p.sourceImageUrl || ''
    const newProj: ImageEditorProject = {
      ...p,
      id,
      sourceImageUrl: startUrl,
      thumbnailUrl: startUrl,
      createdAt: new Date().toISOString(),
      lastEditedAt: new Date().toISOString()
    }
    set(s => ({ projects: [newProj, ...s.projects], activeProjectId: id }))
    get().setSourceImage(startUrl)
    if (p.brandEnabled) get().enableBrand()
    else get().skipBrand()
    return id
  },

  loadProject: (id) => {
    if (!id) {
       set({ activeProjectId: null, session: defaultSession })
       return
    }
    const p = get().projects.find(x => x.id === id)
    if (p) {
      set({ activeProjectId: id })
      get().setSourceImage(p.sourceImageUrl || '')
      if (p.brandEnabled) get().enableBrand()
      else get().skipBrand()
      // in real app, we would load versions and instructions too
    }
  },

  saveProject: () => {
     const { activeProjectId, session, projects } = get()
     if (!activeProjectId) return
     const thumb = session.versions[session.versions.length - 1]?.thumbnailUrl || session.sourceImageUrl
     set({
       projects: projects.map(p => p.id === activeProjectId ? {
         ...p,
         lastEditedAt: new Date().toISOString(),
         thumbnailUrl: thumb || p.thumbnailUrl,
       } : p)
     })
  },

  setSourceImage: (url) => set((s) => ({
    session: {
      ...s.session,
      sourceImageUrl: url,
      versions: [{ id: `v-${Date.now()}`, versionNumber: 1, thumbnailUrl: url, instructionSummary: 'Original image loaded', createdAt: new Date().toISOString() }],
      currentVersionIdx: 0,
    }
  })),

  enableBrand: () => set((s) => ({ session: { ...s.session, brandEnabled: true } })),
  skipBrand: () => set((s) => ({ session: { ...s.session, brandEnabled: false } })),

  setActiveTool: (t) => set({ activeTool: t, drawingMask: null }),

  setDrawingMask: (m) => set({ drawingMask: m }),

  addCanvasMask: (mask) => set((s) => ({ canvasMasks: [...s.canvasMasks, mask] })),
  removeCanvasMask: (instructionId) => set((s) => ({ canvasMasks: s.canvasMasks.filter((m) => m.instructionId !== instructionId) })),

  addInstruction: (instr) => {
    const id = `instr-${Date.now()}`
    set((s) => ({
      instructions: [...s.instructions, { ...instr, id, status: 'Staged', createdAt: new Date().toISOString() }],
      activeInstructionId: id,
    }))
    return id
  },

  updateInstruction: (id, patch) => set((s) => ({
    instructions: s.instructions.map((i) => i.id === id ? { ...i, ...patch } : i)
  })),

  removeInstruction: (id) => set((s) => ({
    instructions: s.instructions.filter((i) => i.id !== id),
    canvasMasks: s.canvasMasks.filter((m) => m.instructionId !== id),
    activeInstructionId: s.activeInstructionId === id ? null : s.activeInstructionId,
  })),

  reorderInstruction: (fromIdx, toIdx) => set((s) => {
    const arr = [...s.instructions]
    const [item] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, item)
    return { instructions: arr }
  }),

  clearStaged: () => set((s) => ({
    instructions: s.instructions.filter((i) => i.status === 'Executed'),
    canvasMasks: [],
    activeInstructionId: null,
  })),

  setActiveInstruction: (id) => set({ activeInstructionId: id }),

  startRegen: () => set({ isRegenerating: true, regenProgress: 0 }),
  tickRegen: (p) => set({ regenProgress: p }),

  completeRegen: (thumbnailUrl, summary) => set((s) => {
    const newVersion: ImageEditorVersion = {
      id: `v-${Date.now()}`,
      versionNumber: s.session.versions.length + 1,
      thumbnailUrl,
      instructionSummary: summary,
      createdAt: new Date().toISOString(),
    }
    return {
      isRegenerating: false,
      regenProgress: 100,
      session: {
        ...s.session,
        sourceImageUrl: thumbnailUrl,
        versions: [...s.session.versions, newVersion],
        currentVersionIdx: s.session.versions.length,
      },
      instructions: s.instructions.map((i) => i.status === 'Staged' ? { ...i, status: 'Executed' as const } : i),
    }
  }),

  failRegen: () => set({ isRegenerating: false, regenProgress: 0 }),

  setExporting: (v) => set({ isExporting: v }),

  setReturnTo: (ctx) => set({ returnTo: ctx }),

  resetSession: () => set({ session: defaultSession, activeTool: null, drawingMask: null, canvasMasks: [], instructions: [], activeInstructionId: null, isRegenerating: false, regenProgress: 0, returnTo: null }),
}))
