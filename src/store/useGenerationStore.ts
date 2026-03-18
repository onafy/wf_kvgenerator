import { create } from 'zustand'
import type { Variant, GenerationJob, JobStatus } from '../types'
import { mockVariants } from '../mock'

interface GenerationStore {
  jobs: GenerationJob[]
  variants: Record<string, Variant[]>
  pinnedVariantIds: string[]
  compareSelection: string[]
  activeJobId: string | null

  startJob: (projectId: string) => string
  updateJobProgress: (jobId: string, progress: number, status: JobStatus) => void
  completeJob: (jobId: string, variants: Variant[]) => void
  failJob: (jobId: string) => void
  addVariants: (projectId: string, variants: Variant[]) => void
  pinVariant: (id: string) => void
  unpinVariant: (id: string) => void
  toggleCompare: (id: string) => void
  clearCompare: () => void
  getVariants: (projectId: string) => Variant[]
  getJob: (jobId: string) => GenerationJob | undefined
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  jobs: [],
  variants: mockVariants,
  pinnedVariantIds: ['v1-1', 'v2-1', 'v3-2'],
  compareSelection: [],
  activeJobId: null,

  startJob: (projectId) => {
    const jobId = `job-${Date.now()}`
    const job: GenerationJob = {
      id: jobId, projectId, status: 'queued', progress: 0,
      startedAt: new Date().toISOString(), variantIds: [],
    }
    set((s) => ({ jobs: [...s.jobs, job], activeJobId: jobId }))
    return jobId
  },

  updateJobProgress: (jobId, progress, status) => set((s) => ({
    jobs: s.jobs.map((j) => j.id === jobId ? { ...j, progress, status } : j)
  })),

  completeJob: (jobId, variants) => {
    const job = get().jobs.find((j) => j.id === jobId)
    if (!job) return
    set((s) => ({
      jobs: s.jobs.map((j) => j.id === jobId ? { ...j, status: 'complete', progress: 100, completedAt: new Date().toISOString(), variantIds: variants.map((v) => v.id) } : j),
      variants: { ...s.variants, [job.projectId]: [...(s.variants[job.projectId] || []), ...variants] },
      activeJobId: null,
    }))
  },

  failJob: (jobId) => set((s) => ({
    jobs: s.jobs.map((j) => j.id === jobId ? { ...j, status: 'failed' } : j),
    activeJobId: null,
  })),

  addVariants: (projectId, variants) => set((s) => ({
    variants: { ...s.variants, [projectId]: [...(s.variants[projectId] || []), ...variants] }
  })),

  pinVariant: (id) => set((s) => ({ pinnedVariantIds: [...s.pinnedVariantIds, id] })),
  unpinVariant: (id) => set((s) => ({ pinnedVariantIds: s.pinnedVariantIds.filter((p) => p !== id) })),

  toggleCompare: (id) => set((s) => {
    const sel = s.compareSelection
    if (sel.includes(id)) return { compareSelection: sel.filter((x) => x !== id) }
    if (sel.length >= 2) return { compareSelection: [sel[1], id] }
    return { compareSelection: [...sel, id] }
  }),

  clearCompare: () => set({ compareSelection: [] }),

  getVariants: (projectId) => get().variants[projectId] || [],

  getJob: (jobId) => get().jobs.find((j) => j.id === jobId),
}))
