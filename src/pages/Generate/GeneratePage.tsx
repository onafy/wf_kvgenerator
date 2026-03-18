import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Sparkles, Pin, PinOff, ArrowLeftRight, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react'
import { useGenerationStore } from '../../store/useGenerationStore'
import { useProjectStore } from '../../store/useProjectStore'
import { useContextStore } from '../../store/useContextStore'
import { useEditorStore } from '../../store/useEditorStore'
import { useExportStore } from '../../store/useExportStore'
import type { Variant } from '../../types'

const MOCK_THUMBS = [
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop',
]

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const steps = ['Queued', 'Validating Brand', 'Generating', 'Complete']
  const stepIdx = status === 'queued' ? 0 : status === 'validating' ? 1 : status === 'processing' ? 2 : 3
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-cimb-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Loader2 size={28} className="text-cimb-red animate-spin" />
      </div>
      <h3 className="font-semibold text-white mb-1">Generating image options...</h3>
      <p className="text-sm text-gray-500 mb-6">Estimated time: ~{Math.max(0, Math.round((100 - progress) * 0.45))}s</p>
      <div className="w-full bg-white/10 rounded-full h-2 mb-6">
        <div className="bg-cimb-red h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex justify-between">
        {steps.map((s, i) => (
          <div key={s} className={`text-xs font-medium ${i <= stepIdx ? 'text-cimb-red' : 'text-gray-600'}`}>{s}</div>
        ))}
      </div>
    </div>
  )
}

function ImageOptionCard({ variant, isPinned, isCompareSelected, onPin, onCompare, onEdit, onExport }: {
  variant: Variant; isPinned: boolean; isCompareSelected: boolean
  onPin: () => void; onCompare: () => void; onEdit: () => void; onExport: () => void
}) {
  return (
    <div
      className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${isCompareSelected ? 'border-blue-400 shadow-lg shadow-blue-400/10' : 'border-white/10 hover:border-white/30'}`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={variant.thumbnailUrl} alt="Image Option" className="w-full h-full object-cover" />
        {variant.isGeneratedWithPreviousContext && (
          <div className="absolute top-2 left-2 bg-amber-500/90 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertTriangle size={10} /> Previous context
          </div>
        )}
        {isPinned && (
          <div className="absolute top-2 right-2 bg-cimb-red text-white rounded-full p-1"><Pin size={10} /></div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{variant.promptUsed}</p>
        <div className="flex gap-1.5 mb-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={onPin} title={isPinned ? 'Unpin' : 'Pin'} className={`p-1.5 rounded-lg border text-xs transition-colors ${isPinned ? 'border-cimb-red bg-cimb-red/20 text-cimb-red' : 'border-white/10 text-gray-500 hover:border-white/30'}`}>
            {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
          <button onClick={onCompare} title="Compare" className={`p-1.5 rounded-lg border text-xs transition-colors ${isCompareSelected ? 'border-blue-400 bg-blue-400/20 text-blue-400' : 'border-white/10 text-gray-500 hover:border-white/30'}`}>
            <ArrowLeftRight size={13} />
          </button>
        </div>
        <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button onClick={onEdit} className="w-full py-1.5 bg-cimb-red text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            Edit this option
          </button>
          <button onClick={onExport} className="w-full py-1.5 bg-white/10 border border-white/20 text-gray-300 text-xs font-medium rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-1">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M2 10h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export / Resize
          </button>
        </div>
      </div>
    </div>
  )
}

function CompareModal({ variantA, variantB, onClose, onEditA, onEditB }: {
  variantA: Variant; variantB: Variant; onClose: () => void
  onEditA: () => void; onEditB: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-frnd-dark rounded-2xl w-full max-w-5xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Compare Image Options</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl font-bold">&times;</button>
        </div>
        <div className="grid grid-cols-2 gap-px bg-white/10">
          {([variantA, variantB] as const).map((v, i) => (
            <div key={v.id} className="bg-white/5 p-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Image Option {i + 1}</div>
              <img src={v.thumbnailUrl} alt="" className="w-full aspect-square object-cover rounded-lg mb-3" />
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{v.promptUsed}</p>
              <div className="flex gap-2">
                <button
                  onClick={i === 0 ? onEditA : onEditB}
                  className="flex-1 py-2 bg-cimb-red text-white text-xs font-medium rounded-lg hover:bg-red-700"
                >
                  Edit this option
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function GeneratePage() {
  const navigate = useNavigate()
  const { id: projectId } = useParams<{ id: string }>()
  const { startJob, updateJobProgress, completeJob, getVariants, pinVariant, unpinVariant, pinnedVariantIds, compareSelection, toggleCompare, clearCompare } = useGenerationStore()
  const { updateProjectStatus } = useProjectStore()
  const { locked, editedAfterGeneration } = useContextStore()
  const { setActiveVariant } = useEditorStore()
  const { setSelectedDimIds } = useExportStore()

  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<string>('queued')
  const [showContextBanner, setShowContextBanner] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const effectiveProjectId = projectId || 'new-project'
  const variants = getVariants(effectiveProjectId)
  const compareVariants = compareSelection.map((id) => variants.find((v) => v.id === id)).filter(Boolean) as Variant[]

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
            promptUsed: `AI-generated image option ${i + 1}: ${locked?.copy || 'Campaign visual'} · ${locked?.segment || 'Retail'} · CIMB brand-safe composition`,
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
    if (variants.length === 0) startGeneration()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  useEffect(() => {
    if (editedAfterGeneration) setShowContextBanner(true)
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Sparkles size={20} className="text-cimb-red" /> AI Visual Generation</h2>
          {locked && <p className="text-sm text-gray-500 mt-0.5">{locked.segment} · {locked.funnel} · CIMB v3</p>}
        </div>
        <div className="flex items-center gap-2">
          {!isGenerating && (
            <button onClick={startGeneration} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-sm font-medium text-gray-300 rounded-lg hover:bg-white/20 hover:border-white/30 transition-all">
              <RefreshCw size={14} /> Generate New Image Options
            </button>
          )}
        </div>
      </div>

      {showContextBanner && (
        <div className="mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <AlertTriangle size={16} /> Updating context will apply to your next generation. Existing image options are unchanged.
          </div>
          <button onClick={() => setShowContextBanner(false)} className="text-amber-500 hover:text-amber-300">&times;</button>
        </div>
      )}


      {compareSelection.length === 2 && (
        <div className="mb-4 bg-blue-600/90 text-white rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium">2 image options selected for comparison</span>
          <div className="flex gap-2">
            <button onClick={() => {}} className="px-3 py-1 bg-white text-blue-600 text-xs font-medium rounded-lg flex items-center gap-1"><ArrowLeftRight size={12} /> Compare</button>
            <button onClick={clearCompare} className="text-white/80 hover:text-white text-sm">&times;</button>
          </div>
        </div>
      )}

      {isGenerating ? (
        <div className="max-w-xl mx-auto mt-8">
          <ProgressBar progress={progress} status={status} />
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-4">{variants.length} image option{variants.length !== 1 ? 's' : ''} generated · Use "Edit this option" to refine, or "Export / Resize" to proceed directly to export.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {variants.map((v) => (
              <ImageOptionCard
                key={v.id}
                variant={v}
                isPinned={pinnedVariantIds.includes(v.id)}
                isCompareSelected={compareSelection.includes(v.id)}
                onPin={() => pinnedVariantIds.includes(v.id) ? unpinVariant(v.id) : pinVariant(v.id)}
                onCompare={() => toggleCompare(v.id)}
                onEdit={() => handleEdit(v)}
                onExport={() => handleExportResize(v)}
              />
            ))}
          </div>
        </>
      )}

      {compareSelection.length === 2 && compareVariants.length === 2 && (
        <CompareModal
          variantA={compareVariants[0]}
          variantB={compareVariants[1]}
          onClose={clearCompare}
          onEditA={() => { clearCompare(); handleEdit(compareVariants[0]) }}
          onEditB={() => { clearCompare(); handleEdit(compareVariants[1]) }}
        />
      )}
    </div>
  )
}
