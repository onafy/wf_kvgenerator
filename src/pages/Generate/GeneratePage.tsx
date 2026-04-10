import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkles, AlertTriangle, Loader2, Plus, Edit2, Download, Maximize2 } from 'lucide-react'
import { useGenerationStore } from '../../store/useGenerationStore'
import { useProjectStore } from '../../store/useProjectStore'
import { useContextStore } from '../../store/useContextStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useExportStore } from '../../store/useExportStore'
import type { Variant } from '../../types'

const MOCK_THUMBS = [
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
]

const SEGMENT_PILL: Record<string, string> = {
  Youth: 'bg-purple-500/20 text-purple-300',
  Family: 'bg-orange-500/20 text-orange-300',
  Mass: 'bg-teal-500/20 text-teal-300',
}

const STATUS_PILL: Record<string, string> = {
  Draft: 'bg-white/10 text-white/50',
  InProgress: 'bg-blue-500/20 text-blue-300',
  Exported: 'bg-emerald-500/20 text-emerald-300',
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const steps = ['Queued', 'Validating Brand', 'Generating', 'Complete']
  const stepIdx = status === 'queued' ? 0 : status === 'validating' ? 1 : status === 'processing' ? 2 : 3
  return (
    <div className="max-w-xl mx-auto mt-16 bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
      <div className="w-16 h-16 bg-cimb-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 size={28} className="text-cimb-red animate-spin" />
      </div>
      <h3 className="font-semibold text-white mb-1">Generating image options...</h3>
      <p className="text-sm text-white/40 mb-6">Estimated time: ~{Math.max(0, Math.round((100 - progress) * 0.45))}s</p>
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
        <div className="bg-cimb-red h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between">
        {steps.map((s, i) => (
          <div key={s} className={`text-xs font-medium ${i <= stepIdx ? 'text-cimb-red' : 'text-white/20'}`}>{s}</div>
        ))}
      </div>
    </div>
  )
}

function ImageOptionCard({ variant, batchLabel, onEdit, onExport }: {
  variant: Variant
  batchLabel: string
  onEdit: () => void
  onExport: () => void
}) {
  const [selected, setSelected] = useState(false)

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${selected ? 'border-white/30 bg-white/[0.07]' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        <img
          src={variant.thumbnailUrl}
          alt="Generated option"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Batch label badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-md text-white/60 border border-white/10">
            {batchLabel}
          </span>
        </div>

        {variant.isGeneratedWithPreviousContext && (
          <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle size={10} /> Previous context
          </div>
        )}

        {/* Select button */}
        <div className="absolute bottom-3 left-3">
          <button
            onClick={() => setSelected((s) => !s)}
            className={`px-5 py-2 rounded-xl text-sm font-medium backdrop-blur-md border transition-all ${
              selected
                ? 'bg-white text-gray-900 border-white'
                : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
            }`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs italic text-white/40 line-clamp-1">&ldquo;{variant.promptUsed}&rdquo;</p>
          <p className="text-[10px] text-white/25 mt-0.5">
            {new Date(variant.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) === '00:00'
              ? 'Just now'
              : 'Just now'}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit() }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.06] border border-white/10 text-xs font-medium text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onExport() }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/[0.06] border border-white/10 text-xs font-medium text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
          >
            <Download size={12} /> Download
          </button>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onExport() }}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-white/[0.06] border border-white/10 text-xs font-medium text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
        >
          <Maximize2 size={12} /> Resize this KV
        </button>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  const navigate = useNavigate()
  const { id: projectId } = useParams<{ id: string }>()
  const { startJob, updateJobProgress, completeJob, getVariants } = useGenerationStore()
  const { updateProjectStatus } = useProjectStore()
  const { locked, editedAfterGeneration } = useContextStore()
  const { setActiveVariant } = useEditorStore()
  const { setSelectedDimIds } = useExportStore()

  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId))

  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('queued')
  const [showContextBanner, setShowContextBanner] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const effectiveProjectId = projectId || 'new-project'
  const variants = getVariants(effectiveProjectId)

  const projectName = project?.name || locked?.copy?.split(' ').slice(0, 2).join('') || 'New Project'
  const segment = project?.segment || locked?.segment || ''
  const funnel = project?.funnel || locked?.funnel || ''
  const projectStatus = project?.status || 'Draft'

  const startGeneration = () => {
    const jId = startJob(effectiveProjectId)
    setProgress(0)
    setStatus('queued')
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2.5
        if (next >= 20 && prev < 20) { setStatus('validating'); updateJobProgress(jId, next, 'validating') }
        else if (next >= 45 && prev < 45) { setStatus('processing'); updateJobProgress(jId, next, 'processing') }
        else if (next >= 100) {
          clearInterval(intervalRef.current!)
          setStatus('complete')
          const newVariants: Variant[] = MOCK_THUMBS.map((url, i) => ({
            id: `${effectiveProjectId}-nv-${Date.now()}-${i}`,
            projectId: effectiveProjectId,
            jobId: jId,
            thumbnailUrl: url,
            promptUsed: `AI-generated image option (mock)`,
            isGeneratedWithPreviousContext: editedAfterGeneration,
            isPinned: false,
            createdAt: new Date().toISOString(),
            batchNumber: 1,
          }))
          completeJob(jId, newVariants)
          if (effectiveProjectId !== 'new-project') updateProjectStatus(effectiveProjectId, 'InProgress')
          return 100
        }
        return next
      })
    }, 200)
  }

  useEffect(() => {
    queueMicrotask(() => { if (variants.length === 0) startGeneration() })
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    queueMicrotask(() => { if (editedAfterGeneration) setShowContextBanner(true) })
  }, [editedAfterGeneration])

  const handleEdit = (variant: Variant) => {
    setActiveVariant(variant.id, effectiveProjectId)
    navigate(`/kv-generator/projects/${effectiveProjectId}/edit`)
  }

  const handleExportResize = (variant: Variant) => {
    setActiveVariant(variant.id, effectiveProjectId)
    setSelectedDimIds([])
    navigate(`/kv-generator/projects/${effectiveProjectId}/export?intent=resize`)
  }

  const isGenerating = status !== 'complete' && variants.length === 0

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-xl font-semibold text-white">{projectName}</h1>
            <span className="text-sm text-white/30">Today</span>
          </div>
          <div className="flex items-center gap-2">
            {segment && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${SEGMENT_PILL[segment] ?? 'bg-white/10 text-white/60'}`}>
                {segment}
              </span>
            )}
            {funnel && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60">
                {funnel}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_PILL[projectStatus] ?? STATUS_PILL.Draft}`}>
              {projectStatus === 'InProgress' ? 'In Progress' : projectStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isGenerating && (
            <button
              onClick={startGeneration}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              <Sparkles size={14} /> Generate New Options
            </button>
          )}
          <button
            onClick={() => navigate(projectId ? `/kv-generator/projects/${projectId}` : '/kv-generator')}
            className="px-4 py-2 bg-white/5 border border-white/10 text-sm font-medium text-white/70 rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            Details
          </button>
        </div>
      </div>

      {/* Context banner */}
      {showContextBanner && (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <AlertTriangle size={15} /> Context updated — changes apply to your next generation. Existing options are unchanged.
          </div>
          <button onClick={() => setShowContextBanner(false)} className="text-amber-500/60 hover:text-amber-400 text-lg leading-none">&times;</button>
        </div>
      )}

      {isGenerating ? (
        <ProgressBar progress={progress} status={status} />
      ) : (
        <>
          {/* Stats line */}
          <p className="text-sm text-white/30 mb-6">
            {variants.length} image option{variants.length !== 1 ? 's' : ''} · 0 edited · 0 exported
          </p>

          {/* Image grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {variants.map((v, _i) => (
              <ImageOptionCard
                key={v.id}
                variant={v}
                batchLabel={`v${v.batchNumber ?? 1}`}
                onEdit={() => handleEdit(v)}
                onExport={() => handleExportResize(v)}
              />
            ))}
          </div>

          {/* Generate More */}
          <div className="flex justify-center mt-10">
            <button
              onClick={startGeneration}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-sm font-medium text-white/60 rounded-2xl hover:bg-white/10 hover:text-white transition-all"
            >
              <Plus size={15} /> Generate More Options
            </button>
          </div>
        </>
      )}
    </div>
  )
}
