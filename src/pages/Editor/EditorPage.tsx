import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Square, Lasso, Type, Eraser, Image as ImageIcon,
  MousePointer2, Undo2, Redo2, History, Lock, Save,
  Sparkles, Loader2, X, GripVertical, AlertTriangle, Download, Maximize2
} from 'lucide-react'
import { useImageEditorStore, type Instruction, type InstructionType, type MaskShape } from '../../store/useImageEditorStore'
import { useVersionStore } from '../../store/useVersionStore'
import { useGenerationStore } from '../../store/useGenerationStore'
import { useProjectStore } from '../../store/useProjectStore'
import { useTemplateStore } from '../../store/useTemplateStore'
import { useExportStore } from '../../store/useExportStore'

// ── Instruction type config ────────────────────────────────────────
const INSTR_CONFIG: Record<InstructionType, { label: string; color: string; bgColor: string }> = {
  InPaint:      { label: 'In-Paint',    color: 'text-blue-700',   bgColor: 'bg-blue-100' },
  Text:         { label: 'Add Text',    color: 'text-violet-700', bgColor: 'bg-violet-100' },
  Erase:        { label: 'Erase',       color: 'text-red-600',    bgColor: 'bg-red-100' },
  AssetOverlay: { label: 'Asset',       color: 'text-green-700',  bgColor: 'bg-green-100' },
}

// ── SaveTemplateModal ─────────────────────────────────────────────
function SaveTemplateModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Save as Template</h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Template Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Master KV — Ramadan Layout" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red" />
          </div>
          <p className="text-xs text-gray-400">Saved from: KV Generator · Visible in Template Library</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={() => { if (name.trim()) { onSave(name); onClose() } }} disabled={!name.trim()} className="flex-1 py-2.5 text-sm font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800 disabled:opacity-50">
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Version History Panel ─────────────────────────────────────────
function VersionPanel({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { getVersions } = useVersionStore()
  const versions = getVersions(projectId)
  return (
    <div className="absolute inset-y-0 right-0 w-72 bg-white border-l border-gray-200 flex flex-col z-20 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Version History</h3>
        <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-8">No versions yet</p>
        ) : (
          [...versions].reverse().map((v) => (
            <div key={v.id} className={`p-3 rounded-lg border ${v.versionNumber === versions.length ? 'border-cimb-red bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${v.versionNumber === versions.length ? 'text-cimb-red' : 'text-gray-700'}`}>v{v.versionNumber}</span>
                {v.isGeneratedWithPreviousContext && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Prev. context</span>}
              </div>
              <img src={v.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded mb-2" />
              <p className="text-xs text-gray-500 line-clamp-2">{v.promptSummary}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── InstructionRow ─────────────────────────────────────────────────
function InstructionRow({ instr, isActive, onActivate, onRemove, onUpdate, dimmed }: {
  instr: Instruction; isActive: boolean; onActivate: () => void; onRemove: () => void
  onUpdate: (patch: Partial<Instruction>) => void; dimmed?: boolean
}) {
  const cfg = INSTR_CONFIG[instr.type]
  const [editing, setEditing] = useState(false)
  return (
    <div
      onClick={onActivate}
      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${isActive ? 'border-cimb-red bg-red-50' : dimmed ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-100 bg-white hover:border-gray-200'}`}
    >
      <div className="flex items-start gap-2">
        {!dimmed && <GripVertical size={12} className="text-gray-300 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${instr.status === 'Staged' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{instr.status}</span>
            {instr.isStatic && <Lock size={10} className="text-violet-500" />}
          </div>
          {editing ? (
            <input
              autoFocus
              value={instr.prompt}
              onChange={(e) => onUpdate({ prompt: e.target.value })}
              onBlur={() => setEditing(false)}
              onClick={(e) => e.stopPropagation()}
              className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-cimb-red"
            />
          ) : (
            <p className="text-xs text-gray-600 line-clamp-2">{instr.prompt || <span className="text-gray-300 italic">No prompt yet</span>}</p>
          )}
          {instr.type === 'Text' && instr.content && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">"{instr.content}"</p>
          )}
        </div>
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!dimmed && (
            <button onClick={() => setEditing(!editing)} className="p-1 text-gray-400 hover:text-gray-700 rounded">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            </button>
          )}
          <button onClick={onRemove} className="p-1 text-gray-400 hover:text-red-500 rounded">
            <X size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Instruction Queue Panel ────────────────────────────────────────
function InstructionQueuePanel({ onRegenerate, onApproveDownload, onApproveResize }: { onRegenerate: () => void; onApproveDownload: () => void; onApproveResize: () => void }) {
  const { instructions, activeInstructionId, setActiveInstruction, removeInstruction, updateInstruction, clearStaged, isRegenerating, regenProgress, session } = useImageEditorStore()

  const staged = instructions.filter((i) => i.status === 'Staged')
  const executed = instructions.filter((i) => i.status === 'Executed')

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Instruction Queue</h3>
          {staged.length > 0 && (
            <button onClick={clearStaged} className="text-xs text-red-400 hover:text-red-600">Clear staged</button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{staged.length} staged · {executed.length} executed</p>
      </div>

      {staged.length > 10 && (
        <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2 text-xs text-amber-700">
          <AlertTriangle size={12} /> More than 10 instructions — consider splitting into multiple jobs.
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {instructions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Draw a mask or use a tool to add instructions</p>
          </div>
        ) : (
          <>
            {staged.length > 0 && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 pt-1">Staged</div>
            )}
            {staged.map((instr) => (
              <InstructionRow key={instr.id} instr={instr} isActive={activeInstructionId === instr.id} onActivate={() => setActiveInstruction(instr.id)} onRemove={() => removeInstruction(instr.id)} onUpdate={(patch) => updateInstruction(instr.id, patch)} />
            ))}
            {executed.length > 0 && (
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 pt-2">Executed</div>
            )}
            {executed.map((instr) => (
              <InstructionRow key={instr.id} instr={instr} isActive={false} onActivate={() => {}} onRemove={() => removeInstruction(instr.id)} onUpdate={() => {}} dimmed />
            ))}
          </>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-gray-100 space-y-2">
        {isRegenerating ? (
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Loader2 size={12} className="animate-spin text-cimb-red" />
              <span>Processing instructions... {Math.round(regenProgress)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="bg-cimb-red h-1.5 rounded-full transition-all" style={{ width: `${regenProgress}%` }} />
            </div>
          </div>
        ) : (
          <button
            onClick={onRegenerate}
            disabled={staged.length === 0 || !session.sourceImageUrl}
            className="w-full py-2.5 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={14} /> Regenerate ({staged.length})
          </button>
        )}
        {/* PRD v1.2 9.D: Two explicit choices — no auto-routing */}
        <div className="pt-1 border-t border-gray-100 space-y-1.5">
          <p className="text-xs text-gray-400 font-medium mb-1">Approve & Export</p>
          <button
            onClick={onApproveDownload}
            className="w-full py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1.5"
          >
            <Download size={12} /> Download as-is
          </button>
          <button
            onClick={onApproveResize}
            className="w-full py-2 bg-cimb-red text-white text-xs font-medium rounded-lg hover:bg-red-800 flex items-center justify-center gap-1.5"
          >
            <Maximize2 size={12} /> Export & Resize for platforms
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inline prompt popover ─────────────────────────────────────────
function InlinePromptInput({ type, onConfirm, onCancel }: {
  type: InstructionType; onConfirm: (data: { prompt: string; content?: string; fillHint?: string }) => void; onCancel: () => void
}) {
  const [prompt, setPrompt] = useState('')
  const [content, setContent] = useState('')
  const [fillHint, setFillHint] = useState('')

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-30">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${INSTR_CONFIG[type].bgColor} ${INSTR_CONFIG[type].color}`}>{INSTR_CONFIG[type].label}</span>
        <button onClick={onCancel}><X size={14} className="text-gray-400" /></button>
      </div>

      {type === 'Text' && (
        <div className="mb-2">
          <label className="block text-xs text-gray-500 mb-1">Text content</label>
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder='What should the text say?' className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cimb-red mb-2" autoFocus />
          <label className="block text-xs text-gray-500 mb-1">Style prompt</label>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='e.g. bold white sans-serif, top-center' className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cimb-red" />
        </div>
      )}

      {type === 'Erase' && (
        <div className="mb-2">
          <label className="block text-xs text-gray-500 mb-1">Optional fill hint</label>
          <input value={fillHint} onChange={(e) => setFillHint(e.target.value)} placeholder='e.g. fill with blue gradient background' className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cimb-red" autoFocus />
          <p className="text-xs text-gray-400 mt-1">Leave blank for content-aware deletion</p>
        </div>
      )}

      {(type === 'InPaint' || type === 'AssetOverlay') && (
        <div className="mb-2">
          <label className="block text-xs text-gray-500 mb-1">{type === 'InPaint' ? 'Prompt for this region' : 'Blend instruction'}</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder={type === 'InPaint' ? 'e.g. replace with warm sunset gradient' : 'e.g. blend naturally as product showcase'} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-cimb-red" autoFocus />
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button onClick={onCancel} className="flex-1 py-1.5 text-xs text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
        <button
          onClick={() => (type === 'Text' ? content.trim() : type === 'Erase' ? true : prompt.trim()) && onConfirm({ prompt, content, fillHint })}
          className="flex-1 py-1.5 text-xs font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800"
        >
          Add to Queue
        </button>
      </div>
    </div>
  )
}

// ── Main Editor Page (KV Generator Sub-D) ─────────────────────────
const REGEN_THUMBS = [
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1593672715438-d88a70629abe?w=600&h=600&fit=crop',
]

export default function EditorPage() {
  const navigate = useNavigate()
  const { id: projectId } = useParams<{ id: string }>()
  const effectiveProjectId = projectId || 'new-project'

  const {
    session, activeTool, setActiveTool,
    drawingMask, setDrawingMask, canvasMasks, addCanvasMask, removeCanvasMask,
    instructions, addInstruction, isRegenerating, regenProgress, startRegen, tickRegen, completeRegen,
    setSourceImage, enableBrand, resetSession,
  } = useImageEditorStore()
  const { addVersion } = useVersionStore()
  const { getVariants } = useGenerationStore()
  const { updateProjectStatus } = useProjectStore()
  const { saveTemplate } = useTemplateStore()
  const { setSelectedDimIds } = useExportStore()

  const [showHistory, setShowHistory] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [pendingMask, setPendingMask] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [pendingInstrType, setPendingInstrType] = useState<InstructionType | null>(null)
  const [showInlinePrompt, setShowInlinePrompt] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const regenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const variants = getVariants(effectiveProjectId)
  const activeVariant = variants[variants.length - 1] || variants[0]

  // Sync active variant image into image editor store (brand always on in KV Generator)
  useEffect(() => {
    if (activeVariant?.thumbnailUrl && session.sourceImageUrl !== activeVariant.thumbnailUrl) {
      resetSession()
      setSourceImage(activeVariant.thumbnailUrl)
      enableBrand()
    }
  }, [activeVariant?.thumbnailUrl])

  const currentImage = activeVariant?.thumbnailUrl || session.sourceImageUrl

  // PRD v1.2: KV Generator Sub-D uses Rectangle (Bounding Box) + Freehand/Lasso only
  const maskTools: MaskShape[] = ['rectangle', 'freehand']
  const MASK_TOOL_ICONS: Record<MaskShape, React.ReactNode> = {
    rectangle: <Square size={15} />,
    ellipse: <Square size={15} />, // unused in KV Generator
    polygon: <Square size={15} />, // unused in KV Generator
    freehand: <Lasso size={15} />,
  }

  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }
  }

  const getInstrTypeForTool = (): InstructionType => {
    if (activeTool === 'text') return 'Text'
    if (activeTool === 'erase') return 'Erase'
    if (activeTool === 'overlay') return 'AssetOverlay'
    return 'InPaint'
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeTool || activeTool === 'move') return
    if (activeTool === 'text') {
      setPendingMask({ x: 30, y: 30, width: 40, height: 15 })
      setPendingInstrType('Text')
      setShowInlinePrompt(true)
      return
    }
    e.preventDefault()
    const { x, y } = getCanvasCoords(e)
    drawStartRef.current = { x, y }
    setDrawingMask({ shape: activeTool as MaskShape, x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawStartRef.current || !activeTool || activeTool === 'move' || activeTool === 'text' || activeTool === 'erase' || activeTool === 'overlay') return
    const { x, y } = getCanvasCoords(e)
    setDrawingMask({
      shape: activeTool as MaskShape,
      x: Math.min(drawStartRef.current.x, x),
      y: Math.min(drawStartRef.current.y, y),
      width: Math.abs(x - drawStartRef.current.x),
      height: Math.abs(y - drawStartRef.current.y),
    })
  }

  const handleMouseUp = () => {
    if (!drawingMask || !activeTool || activeTool === 'move') return
    if (drawingMask.width > 3 && drawingMask.height > 3) {
      setPendingMask({ x: drawingMask.x, y: drawingMask.y, width: drawingMask.width, height: drawingMask.height })
      setPendingInstrType(getInstrTypeForTool())
      setShowInlinePrompt(true)
    }
    drawStartRef.current = null
    setDrawingMask(null)
  }

  const handleConfirmInstruction = ({ prompt, content, fillHint }: { prompt: string; content?: string; fillHint?: string }) => {
    if (!pendingMask || !pendingInstrType) return
    const label = pendingInstrType === 'Text' ? `Text: "${content?.slice(0, 20)}"` : `${INSTR_CONFIG[pendingInstrType].label} region`
    const instrId = addInstruction({
      type: pendingInstrType, label, prompt,
      content: content || undefined, fillHint: fillHint || undefined,
      mask: { shape: (activeTool as MaskShape) || 'rectangle', ...pendingMask },
    })
    if (pendingInstrType !== 'Text') {
      addCanvasMask({ instructionId: instrId, shape: (activeTool as MaskShape) || 'rectangle', ...pendingMask })
    }
    setShowInlinePrompt(false)
    setPendingMask(null)
    setPendingInstrType(null)
  }

  const handleRegenerate = () => {
    const staged = instructions.filter((i) => i.status === 'Staged')
    if (staged.length === 0) return
    startRegen()
    let p = 0
    regenIntervalRef.current = setInterval(() => {
      p += 3
      tickRegen(Math.min(p, 95))
      if (p >= 100) {
        clearInterval(regenIntervalRef.current!)
        const summary = staged.map((i) => i.label || i.prompt).join('; ')
        const newThumb = REGEN_THUMBS[Math.floor(Math.random() * REGEN_THUMBS.length)]
        completeRegen(newThumb, summary)
        addVersion(effectiveProjectId, { thumbnailUrl: newThumb, action: 'InPainting', promptSummary: summary || 'Canvas instruction edits', createdBy: 'Budi Santoso' })
      }
    }, 150)
  }

  // PRD v1.2 9.D: Approve shows two explicit choices — Download or Export & Resize
  const handleApproveDownload = () => {
    updateProjectStatus(effectiveProjectId, 'Exported')
    navigate(`/kv-generator/projects/${effectiveProjectId}/export?intent=original`)
  }

  const handleApproveResize = () => {
    updateProjectStatus(effectiveProjectId, 'Exported')
    // Clear previous dimension selections so user starts fresh
    setSelectedDimIds([])
    navigate(`/kv-generator/projects/${effectiveProjectId}/export?intent=resize`)
  }

  const toolGroups = [
    { label: 'Mask', tools: maskTools.map((s) => ({ id: s, icon: MASK_TOOL_ICONS[s], tip: s.charAt(0).toUpperCase() + s.slice(1) })) },
    { label: 'Tools', tools: [
      { id: 'text', icon: <Type size={15} />, tip: 'Add Text' },
      { id: 'erase', icon: <Eraser size={15} />, tip: 'Erase Region' },
      { id: 'overlay', icon: <ImageIcon size={15} />, tip: 'Asset Overlay' },
    ]},
    { label: 'Nav', tools: [{ id: 'move', icon: <MousePointer2 size={15} />, tip: 'Move / Select' }] },
  ]

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden">
      {/* Left Toolbar */}
      <div className="w-14 bg-frnd-dark flex flex-col items-center py-3 gap-1 shrink-0">
        {toolGroups.map((grp, gi) => (
          <div key={gi} className="w-full flex flex-col items-center gap-1">
            {gi > 0 && <div className="w-8 h-px bg-white/10 my-1" />}
            {grp.tools.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTool(t.id === activeTool ? null : t.id as any)}
                title={t.tip}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${activeTool === t.id ? 'bg-cimb-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        ))}
        <div className="flex-1" />
        <div className="w-8 h-px bg-white/10 my-1" />
        <button onClick={() => {}} title="Undo" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"><Undo2 size={15} /></button>
        <button onClick={() => {}} title="Redo" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"><Redo2 size={15} /></button>
        <button onClick={() => setShowHistory(!showHistory)} title="Version History" className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${showHistory ? 'bg-cimb-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
          <History size={15} />
        </button>
      </div>

      {/* Canvas area */}
      <div className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
        {/* Canvas topbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700 font-medium">
            <Lock size={10} /> CIMB Brand Active
          </div>
          <span className="text-xs text-gray-400">v{session.versions.length} · {session.versions.length === 1 ? 'Original' : 'Edited'}</span>
          <div className="flex-1" />
          {activeTool && (
            <span className="text-xs text-cimb-red font-medium capitalize">
              {activeTool === 'move' ? 'Select / Move' : activeTool === 'text' ? 'Add Text' : activeTool === 'erase' ? 'Erase Region' : activeTool === 'overlay' ? 'Asset Overlay' : `${activeTool} mask`} tool active
            </span>
          )}
          <button onClick={() => setShowSaveTemplate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Save size={12} /> Save Template
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {isRegenerating && (
            <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center">
              <Loader2 size={36} className="text-white animate-spin mb-4" />
              <p className="text-white font-medium mb-3">Executing instruction queue...</p>
              <div className="w-64 bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${regenProgress}%` }} />
              </div>
              <p className="text-white/60 text-xs mt-2">{Math.round(regenProgress)}%</p>
            </div>
          )}

          <div
            ref={canvasRef}
            className={`relative bg-white shadow-2xl rounded overflow-hidden select-none ${activeTool && activeTool !== 'move' ? 'cursor-crosshair' : 'cursor-default'}`}
            style={{ width: 'min(65vh, 560px)', height: 'min(65vh, 560px)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {currentImage && <img src={currentImage} alt="Canvas" className="w-full h-full object-cover pointer-events-none" />}

            {/* Canvas masks */}
            {canvasMasks.map((mask) => {
              const instrType = instructions.find((i) => i.id === mask.instructionId)?.type || 'InPaint'
              const colorMap: Record<InstructionType, string> = { InPaint: 'border-blue-400 bg-blue-400/10', Text: 'border-violet-500 bg-violet-400/10', Erase: 'border-red-400 bg-red-400/10', AssetOverlay: 'border-green-400 bg-green-400/10' }
              const shapeClass = mask.shape === 'ellipse' ? 'rounded-full' : 'rounded'
              return (
                <div key={mask.instructionId}
                  className={`absolute border-2 ${colorMap[instrType]} ${shapeClass}`}
                  style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: `${mask.width}%`, height: `${mask.height}%` }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); removeCanvasMask(mask.instructionId) }}
                    className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X size={9} />
                  </button>
                </div>
              )
            })}

            {/* Drawing preview */}
            {drawingMask && drawingMask.width > 0 && (
              <div
                className={`absolute border-2 border-dashed border-cimb-red bg-cimb-red/10 pointer-events-none ${drawingMask.shape === 'ellipse' ? 'rounded-full' : ''}`}
                style={{ left: `${drawingMask.x}%`, top: `${drawingMask.y}%`, width: `${drawingMask.width}%`, height: `${drawingMask.height}%` }}
              />
            )}

            {/* Brand locked element */}
            <div className="absolute bottom-3 right-3 bg-white/90 rounded px-2 py-1 flex items-center gap-1 shadow">
              <Lock size={10} className="text-cimb-red" />
              <span className="text-xs text-gray-600 font-medium">CIMB Logo locked</span>
            </div>
          </div>

          {/* Inline prompt input */}
          {showInlinePrompt && pendingInstrType && (
            <InlinePromptInput
              type={pendingInstrType}
              onConfirm={handleConfirmInstruction}
              onCancel={() => { setShowInlinePrompt(false); setPendingMask(null) }}
            />
          )}

          {/* Tool hint */}
          {activeTool && !showInlinePrompt && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-frnd-dark text-white text-xs px-3 py-2 rounded-full pointer-events-none">
              {maskTools.includes(activeTool as MaskShape) && 'Click and drag to draw mask'}
              {activeTool === 'text' && 'Click canvas to place text'}
              {activeTool === 'erase' && 'Draw over region to erase'}
              {activeTool === 'overlay' && 'Click to place asset overlay'}
            </div>
          )}

          {showHistory && <VersionPanel projectId={effectiveProjectId} onClose={() => setShowHistory(false)} />}
        </div>
      </div>

      {/* Right: Instruction Queue Panel (KV Generator-specific: includes Approve & Export) */}
      <InstructionQueuePanel onRegenerate={handleRegenerate} onApproveDownload={handleApproveDownload} onApproveResize={handleApproveResize} />

      {showSaveTemplate && (
        <SaveTemplateModal
          onClose={() => setShowSaveTemplate(false)}
          onSave={(name) => saveTemplate(name, 'KVGenerator', currentImage || '', false)}
        />
      )}
    </div>
  )
}
