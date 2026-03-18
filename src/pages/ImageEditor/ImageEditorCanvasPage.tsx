import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Square, Circle, Pentagon, Lasso, Type, Eraser, Image as ImageIcon,
  MousePointer2, Undo2, Redo2, History, Lock, Save, Download,
  ChevronRight, Sparkles, Loader2, X, GripVertical, AlertTriangle,
  Maximize2, Wand2, RotateCw
} from 'lucide-react'
import { useImageEditorStore, type Instruction, type InstructionType, type MaskShape } from '../../store/useImageEditorStore'
import { useTemplateStore } from '../../store/useTemplateStore'

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
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Product Banner Edit — Clean BG" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red" />
          </div>
          <p className="text-xs text-gray-400">Saved from: Image Editor · Visible in KV Generator Template Library</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button
            onClick={() => { if (name.trim()) { onSave(name); onClose() } }}
            disabled={!name.trim()}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800 disabled:opacity-50"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ExportModal — PRD 9.I: two explicit choices ───────────────────
// "Download as-is" or "Export & Resize for platforms" — no auto-resize
function ExportModal({ onClose, onExport }: { onClose: () => void; onExport: () => void }) {
  const navigate = useNavigate()
  type ExportStep = 'intent' | 'download' | 'done'
  const [step, setStep] = useState<ExportStep>('intent')
  const [filename, setFilename] = useState('image-editor-export')
  const [format, setFormat] = useState<'png' | 'jpg'>('png')

  const handleDownload = () => {
    setStep('done')
    onExport()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {step === 'intent' ? 'Export Image' : step === 'download' ? 'Download as-is' : 'Export complete'}
          </h3>
          <button onClick={onClose}><X size={18} className="text-gray-400" /></button>
        </div>

        {/* Step 0: Intent — two explicit choices */}
        {step === 'intent' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 mb-4">Choose how you want to export this image.</p>

            {/* Download as-is */}
            <button
              onClick={() => setStep('download')}
              className="w-full p-4 rounded-xl border-2 border-gray-200 text-left hover:border-cimb-red hover:bg-red-50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-cimb-red/10 flex items-center justify-center shrink-0">
                  <Download size={16} className="text-gray-500 group-hover:text-cimb-red" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">Download as-is</p>
                  <p className="text-xs text-gray-500">Export at original resolution — PNG or JPG, no resizing applied.</p>
                </div>
              </div>
            </button>

            {/* Export & Resize for platforms */}
            <button
              onClick={() => { onClose(); navigate('/resizer') }}
              className="w-full p-4 rounded-xl border-2 border-gray-200 text-left hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0">
                  <Maximize2 size={16} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">Export & Resize for platforms</p>
                  <p className="text-xs text-gray-500">
                    Open in Resizer to select Instagram, Facebook, GDN and other platform sizes.
                    <span className="ml-1 text-gray-400">(Downloads file first in MVP)</span>
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 1: Download config */}
        {step === 'download' && (
          <>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Filename</label>
                <input value={filename} onChange={(e) => setFilename(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Format</label>
                <div className="flex gap-2">
                  {(['png', 'jpg'] as const).map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${format === f ? 'border-cimb-red bg-red-50 text-cimb-red font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      .{f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500">
                <div className="flex justify-between"><span>Resolution</span><span className="font-medium text-gray-700">Original source resolution</span></div>
                <div className="flex justify-between mt-1"><span>Filename</span><span className="font-medium text-gray-700">{filename}.{format}</span></div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('intent')} className="flex-1 py-2.5 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">← Back</button>
              <button onClick={handleDownload} className="flex-1 py-2.5 text-sm font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800 flex items-center justify-center gap-2">
                <Download size={14} /> Download
              </button>
            </div>
          </>
        )}

        {/* Step 2: Done */}
        {step === 'done' && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L8.5 14.5L16 7" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p className="font-semibold text-gray-900 mb-1">Export complete!</p>
            <p className="text-xs text-gray-500 mb-5">{filename}.{format} downloaded</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Need platform sizes?</p>
              <p className="text-xs text-gray-500 mb-3">Open Resizer to generate all standard ad dimensions from your exported file.</p>
              <button
                onClick={() => { onClose(); navigate('/resizer') }}
                className="w-full py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
              >
                Open in Resizer <ChevronRight size={14} />
              </button>
            </div>
            <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Version History Panel ─────────────────────────────────────────
function VersionPanel({ onClose }: { onClose: () => void }) {
  const { session } = useImageEditorStore()
  const versions = [...session.versions].reverse()
  return (
    <div className="absolute inset-y-0 right-0 w-72 bg-white border-l border-gray-200 flex flex-col z-20 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 text-sm">Version History</h3>
        <button onClick={onClose}><X size={16} className="text-gray-400" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.map((v, idx) => (
          <div key={v.id} className={`p-3 rounded-lg border ${idx === 0 ? 'border-cimb-red bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-semibold ${idx === 0 ? 'text-cimb-red' : 'text-gray-700'}`}>v{v.versionNumber}</span>
              {idx === 0 && <span className="text-xs bg-cimb-red text-white px-1.5 py-0.5 rounded-full">Current</span>}
            </div>
            <img src={v.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded mb-2" />
            <p className="text-xs text-gray-500 line-clamp-2">{v.instructionSummary}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Instruction Queue Panel ───────────────────────────────────────
function InstructionQueuePanel({
  onRegenerate,
}: { onRegenerate: () => void }) {
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

      {/* Regenerate button */}
      <div className="p-3 border-t border-gray-100">
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
            className="w-full py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={15} /> Regenerate ({staged.length})
          </button>
        )}
      </div>
    </div>
  )
}

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

// ── Inline prompt popover (appears near drawn mask) ───────────────
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

// ── Main Canvas Page ──────────────────────────────────────────────
const REGEN_THUMBS = [
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1593672715438-d88a70629abe?w=600&h=600&fit=crop',
]

export default function ImageEditorCanvasPage() {
  const navigate = useNavigate()
  const {
    session, activeTool, setActiveTool,
    drawingMask, setDrawingMask, canvasMasks, addCanvasMask, removeCanvasMask,
    instructions, addInstruction, isRegenerating, regenProgress, startRegen, tickRegen, completeRegen,
    setExporting, returnTo, setReturnTo,
  } = useImageEditorStore()
  const { saveTemplate } = useTemplateStore()

  const [showHistory, setShowHistory] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [pendingMask, setPendingMask] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [pendingInstrType, setPendingInstrType] = useState<InstructionType | null>(null)
  const [showInlinePrompt, setShowInlinePrompt] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const regenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentImage = session.sourceImageUrl

  if (!currentImage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-500 mb-3">No image loaded.</p>
          <button onClick={() => navigate('/image-editor')} className="text-sm text-cimb-red hover:underline">← Back to Image Editor</button>
        </div>
      </div>
    )
  }

  const maskTools: MaskShape[] = ['rectangle', 'ellipse', 'polygon', 'freehand']
  const MASK_TOOL_ICONS: Record<MaskShape, React.ReactNode> = {
    rectangle: <Square size={15} />,
    ellipse: <Circle size={15} />,
    polygon: <Pentagon size={15} />,
    freehand: <Lasso size={15} />,
  }

  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 }
  }

  // PRD 9.B.1: Auto-Mask is primary tool — simulate click-to-segment
  const handleAutoMaskClick = (e: React.MouseEvent) => {
    if (activeTool !== 'automask') return
    const { x, y } = getCanvasCoords(e)
    // Simulate AI segmentation: place a centered mask around clicked point
    const w = 30 + Math.random() * 20
    const h = 25 + Math.random() * 15
    setPendingMask({ x: Math.max(0, x - w / 2), y: Math.max(0, y - h / 2), width: w, height: h })
    setPendingInstrType('InPaint')
    setShowInlinePrompt(true)
  }

  const getInstrTypeForTool = (): InstructionType => {
    if (activeTool === 'text') return 'Text'
    if (activeTool === 'erase') return 'Erase'
    if (activeTool === 'overlay') return 'AssetOverlay'
    return 'InPaint'
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeTool || activeTool === 'move') return
    if (activeTool === 'automask') {
      handleAutoMaskClick(e)
      return
    }
    if (activeTool === 'text') {
      // Text tool: trigger inline prompt immediately
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
    if (!drawStartRef.current || !activeTool || activeTool === 'move' || activeTool === 'automask' || activeTool === 'text' || activeTool === 'erase' || activeTool === 'overlay') return
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
      }
    }, 150)
  }

  const toolGroups = [
    { label: 'Mask', tools: [
      // PRD 9.B.1: Auto-Mask is the primary default tool — listed first with star indicator
      { id: 'automask', icon: <Wand2 size={15} />, tip: 'Auto-Mask ★ (click object to select)' },
      ...maskTools.map((s) => ({ id: s, icon: MASK_TOOL_ICONS[s], tip: s.charAt(0).toUpperCase() + s.slice(1) })),
    ]},
    { label: 'Tools', tools: [
      { id: 'text', icon: <Type size={15} />, tip: 'Add Text' },
      { id: 'erase', icon: <Eraser size={15} />, tip: 'Erase Region' },
      { id: 'overlay', icon: <ImageIcon size={15} />, tip: 'Asset Overlay' },
      { id: 'rotate', icon: <RotateCw size={15} />, tip: 'Rotate Element' },
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
              <div key={t.id} className="relative">
                <button
                  onClick={() => setActiveTool(t.id === activeTool ? null : t.id as any)}
                  title={t.tip}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${activeTool === t.id ? 'bg-cimb-red text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  {t.icon}
                </button>
                {/* PRD 9.B.1: mark Auto-Mask as primary tool */}
                {t.id === 'automask' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center text-[7px] text-white font-bold leading-none">★</span>
                )}
              </div>
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
          {session.brandEnabled && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full text-xs text-green-700 font-medium">
              <Lock size={10} /> CIMB Brand Active
            </div>
          )}
          <span className="text-xs text-gray-400">v{session.versions.length} · {session.versions.length === 1 ? 'Original' : 'Edited'}</span>
          <div className="flex-1" />
          {activeTool && (
            <span className="text-xs text-cimb-red font-medium capitalize flex items-center gap-1">
              {activeTool === 'automask' && <><Wand2 size={11} /> Auto-Mask — click any object</>}
              {activeTool === 'move' && 'Select / Move tool active'}
              {activeTool === 'text' && 'Add Text tool active'}
              {activeTool === 'erase' && 'Erase Region tool active'}
              {activeTool === 'overlay' && 'Asset Overlay tool active'}
              {maskTools.includes(activeTool as MaskShape) && `${activeTool} mask tool active`}
            </span>
          )}
          <button onClick={() => setShowSaveTemplate(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Save size={12} /> Save Template
          </button>
          {returnTo && (
            <button
              onClick={() => { setReturnTo(null); navigate(returnTo.path) }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900"
            >
              <ChevronRight size={12} className="rotate-180" /> Back to {returnTo.label}
            </button>
          )}
          <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800">
            <Download size={12} /> Export
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
            className={`relative bg-white shadow-2xl rounded overflow-hidden select-none ${activeTool === 'automask' ? 'cursor-cell' : activeTool && activeTool !== 'move' ? 'cursor-crosshair' : 'cursor-default'}`}
            style={{ width: 'min(65vh, 560px)', height: 'min(65vh, 560px)' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <img src={currentImage} alt="Canvas" className="w-full h-full object-cover pointer-events-none" />

            {/* Canvas masks */}
            {canvasMasks.map((mask) => {
              const instrType = instructions.find((i) => i.id === mask.instructionId)?.type || 'InPaint'
              const colorMap: Record<InstructionType, string> = { InPaint: 'border-blue-400 bg-blue-400/10', Text: 'border-violet-500 bg-violet-400/10', Erase: 'border-red-400 bg-red-400/10', AssetOverlay: 'border-green-400 bg-green-400/10' }
              const borderClass = colorMap[instrType]
              const shapeClass = mask.shape === 'ellipse' ? 'rounded-full' : 'rounded'
              return (
                <div key={mask.instructionId}
                  className={`absolute border-2 ${borderClass} ${shapeClass}`}
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

            {/* Lock indicator for brand assets */}
            {session.brandEnabled && (
              <div className="absolute bottom-3 right-3 bg-white/90 rounded px-2 py-1 flex items-center gap-1 shadow">
                <Lock size={10} className="text-cimb-red" />
                <span className="text-xs text-gray-600 font-medium">Brand assets locked</span>
              </div>
            )}
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
              {activeTool === 'automask' && '✦ Click any object to auto-select it'}
              {maskTools.includes(activeTool as MaskShape) && 'Click and drag to draw mask'}
              {activeTool === 'text' && 'Click canvas to place text'}
              {activeTool === 'erase' && 'Draw over region to erase'}
              {activeTool === 'overlay' && 'Click to place asset overlay'}
            </div>
          )}

          {showHistory && <VersionPanel onClose={() => setShowHistory(false)} />}
        </div>
      </div>

      {/* Right: Instruction Queue Panel */}
      <InstructionQueuePanel onRegenerate={handleRegenerate} />

      {/* Modals */}
      {showSaveTemplate && (
        <SaveTemplateModal
          onClose={() => setShowSaveTemplate(false)}
          onSave={(name) => saveTemplate(name, 'ImageEditor', currentImage, false)}
        />
      )}
      {showExport && (
        <ExportModal
          onClose={() => setShowExport(false)}
          onExport={() => setExporting(true)}
        />
      )}
    </div>
  )
}
