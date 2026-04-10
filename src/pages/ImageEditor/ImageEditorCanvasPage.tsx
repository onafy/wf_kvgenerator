import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Square, Lasso, Type, Eraser, Image as ImageIcon,
  MousePointer2, Undo2, Redo2, History, Lock, Save, Download,
  Sparkles, Loader2, X, GripVertical, AlertTriangle,
  Maximize2, ArrowLeft, Upload, BookOpen, Plus, Pencil, Layers,
} from 'lucide-react'
import { useImageEditorStore, type Instruction, type InstructionType, type MaskShape } from '../../store/useImageEditorStore'
import { useTemplateStore } from '../../store/useTemplateStore'
import { DAMBrowserModal } from '../../components/shared/DAMBrowserModal'

// ── Canvas Asset ─────────────────────────────────────────────────
interface CanvasAsset {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
  prompt: string
}

// ── Instruction type config ──────────────────────────────────────
const INSTR_CONFIG: Record<InstructionType, { label: string; color: string; bgColor: string }> = {
  InPaint:      { label: 'In-Paint',    color: 'text-blue-400',   bgColor: 'bg-blue-500/20' },
  Text:         { label: 'Add Text',    color: 'text-violet-400', bgColor: 'bg-violet-500/20' },
  Erase:        { label: 'Erase',       color: 'text-red-400',    bgColor: 'bg-red-500/20' },
  AssetOverlay: { label: 'Asset',       color: 'text-green-400',  bgColor: 'bg-green-500/20' },
}

// ── SaveTemplateModal ─────────────────────────────────────────────
function SaveTemplateModal({
  onClose,
  onSave,
  previewImageUrl,
  canvasSize = '1080 × 1080 px',
}: {
  onClose: () => void
  onSave: (name: string, description: string) => void
  previewImageUrl?: string
  canvasSize?: string
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const handleSave = async () => {
    if (!name.trim()) return
    setState('saving')
    try {
      await onSave(name, description)
      setState('success')
      setTimeout(() => { onClose() }, 1500)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2500)
    }
  }

  if (state === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-frnd-dark rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 border border-green-500/30 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <p className="text-base font-semibold text-white mb-1">Template Saved</p>
          <p className="text-xs text-white/40 text-center">"{name}" saved to your template library</p>
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-frnd-dark rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 border border-red-500/30 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <p className="text-base font-semibold text-white mb-1">Failed to save template</p>
          <p className="text-xs text-white/40 text-center">Please try again or check your connection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-frnd-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Save as Template</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><X size={16} /></button>
        </div>
        <div className="flex justify-center bg-black/20 py-5 border-b border-white/10">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-black/40 border border-white/10 shadow-inner">
            {previewImageUrl ? (
              <img src={previewImageUrl} alt="Template preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" /></svg>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Template Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Master KV — Ramadan Layout" className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Describe the template style, mood, or use case..." className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-white/30 transition-all" />
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs text-white/40">Canvas Size</span>
            <span className="text-xs font-medium text-white/70">{canvasSize}</span>
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm text-white/50 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!name.trim() || state === 'saving'} className="flex-1 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {state === 'saving' ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ExportModal ───────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-frnd-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="font-semibold text-white">
            {step === 'intent' ? 'Export Image' : step === 'download' ? 'Download as-is' : 'Export complete'}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5">
          {step === 'intent' && (
            <div className="space-y-3">
              <p className="text-xs text-white/40 mb-4">Choose how you want to export this image.</p>
              <button
                onClick={() => setStep('download')}
                className="w-full p-4 rounded-xl border border-white/10 text-left hover:border-white/20 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0">
                    <Download size={16} className="text-white/50 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-0.5">Download as-is</p>
                    <p className="text-xs text-white/40">Export at original resolution — PNG or JPG, no resizing applied.</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { onClose(); navigate('/resizer') }}
                className="w-full p-4 rounded-xl border border-white/10 text-left hover:border-white/20 hover:bg-white/5 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0">
                    <Maximize2 size={16} className="text-white/50 group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm mb-0.5">Export & Resize for platforms</p>
                    <p className="text-xs text-white/40">Open in Resizer to select Instagram, Facebook, GDN and other platform sizes. <span className="text-white/25">(Downloads file first in MVP)</span></p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 'download' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Filename</label>
                <input value={filename} onChange={(e) => setFilename(e.target.value)} className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Format</label>
                <div className="flex gap-2">
                  {(['png', 'jpg'] as const).map((f) => (
                    <button key={f} onClick={() => setFormat(f)} className={`flex-1 py-2 text-sm rounded-xl border transition-all ${format === f ? 'border-white/30 bg-white/10 text-white font-medium' : 'border-white/10 text-white/50 hover:bg-white/5'}`}>
                      .{f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs text-white/40 space-y-1">
                <div className="flex justify-between"><span>Resolution</span><span className="font-medium text-white/60">Original source resolution</span></div>
                <div className="flex justify-between"><span>Filename</span><span className="font-medium text-white/60">{filename}.{format}</span></div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep('intent')} className="flex-1 py-2.5 text-sm text-white/50 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">← Back</button>
                <button onClick={handleDownload} className="flex-1 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <Download size={14} /> Download
                </button>
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10L8.5 14.5L16 7" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <p className="font-semibold text-white mb-1">Export complete!</p>
              <p className="text-xs text-white/40 mb-5">{filename}.{format} downloaded</p>
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left mb-4">
                <p className="text-sm font-medium text-white mb-1">Need platform sizes?</p>
                <p className="text-xs text-white/40 mb-3">Open Resizer to generate all standard ad dimensions from your exported file.</p>
                <button onClick={() => { onClose(); navigate('/resizer') }} className="w-full py-2 bg-white text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors">
                  Open in Resizer →
                </button>
              </div>
              <button onClick={onClose} className="text-xs text-white/30 hover:text-white/60 transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Version History Panel ─────────────────────────────────────────
function VersionPanel({ onClose }: { onClose: () => void }) {
  const { session } = useImageEditorStore()
  const versions = [...session.versions].reverse()
  return (
    <div className="absolute inset-y-0 right-0 w-72 bg-frnd-dark border-l border-white/10 flex flex-col z-20 shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-semibold text-white text-sm">Version History</h3>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.length === 0 ? (
          <p className="text-xs text-white/25 text-center py-8">No versions yet</p>
        ) : (
          versions.map((v, idx) => (
            <div key={v.id} className={`p-3 rounded-lg border ${idx === 0 ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${idx === 0 ? 'text-white' : 'text-white/40'}`}>v{v.versionNumber}</span>
                <div className="flex items-center gap-1.5">
                  {idx === 0 && <span className="text-xs bg-white/15 text-white px-1.5 py-0.5 rounded-full">Current</span>}
                  {v.isGeneratedWithPreviousContext && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">Prev. context</span>}
                </div>
              </div>
              <img src={v.thumbnailUrl} alt="" className="w-full aspect-video object-cover rounded mb-2" />
              <p className="text-xs text-white/40 line-clamp-2">{v.instructionSummary}</p>
              <p className="text-xs text-white/25 mt-1">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Canvas Items Panel ─────────────────────────────────────────────
function CanvasItemsPanel({
  sourceImageUrl,
  instructions,
  canvasAssets,
  onRemoveInstruction,
  onRemoveSource,
  onRemoveCanvasAsset,
  onEditInstruction,
}: {
  sourceImageUrl: string | null
  instructions: Instruction[]
  canvasAssets: CanvasAsset[]
  onRemoveInstruction: (id: string) => void
  onRemoveSource: () => void
  onRemoveCanvasAsset: (id: string) => void
  onEditInstruction?: (id: string) => void
}) {
  const total = (sourceImageUrl ? 1 : 0) + instructions.length + canvasAssets.length

  return (
    <div className="w-56 bg-[#0f0f0f] border-r border-white/[0.07] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <div>
          <span className="text-xs font-semibold text-white">Canvas Items</span>
          <span className="text-[10px] text-white/30 block mt-0.5">{total} on canvas</span>
        </div>
        <button className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
          <Plus size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sourceImageUrl && (
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.06] border border-white/10 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 shrink-0">
              <img src={sourceImageUrl} alt="source" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/80 truncate leading-tight">
                {sourceImageUrl.split('/').pop()?.split('?')[0]?.slice(0, 22) || 'image.jpeg'}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">0° · drag to move</p>
            </div>
            <button onClick={onRemoveSource} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 transition-all mt-0.5 shrink-0"><X size={12} /></button>
          </div>
        )}
        {instructions.map((instr) => (
          <div key={instr.id} className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.06] border border-white/10 group">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/80 truncate leading-tight">
                {instr.content ? `"${instr.content.slice(0, 20)}"` : instr.label || instr.type}
              </p>
              <p className="text-[10px] text-white/30 mt-0.5 truncate">{instr.prompt || 'no prompt'}</p>
            </div>
            {onEditInstruction && (
              <button onClick={() => onEditInstruction(instr.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-cyan-400 transition-all mt-0.5 shrink-0" title="Edit prompt">
                <Pencil size={11} />
              </button>
            )}
            <button onClick={() => onRemoveInstruction(instr.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 transition-all mt-0.5 shrink-0"><X size={12} /></button>
          </div>
        ))}
        {canvasAssets.map((ca) => (
          <div key={ca.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.06] border border-cyan-500/20 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 shrink-0">
              <img src={ca.thumbnailUrl || ca.url} alt={ca.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/80 truncate leading-tight">{ca.name}</p>
              <p className="text-[10px] text-white/30 mt-0.5 truncate">
                {ca.prompt ? `"${ca.prompt.slice(0, 24)}"` : `${Math.round(ca.rotation)}° rotation`}
              </p>
            </div>
            <button onClick={() => onRemoveCanvasAsset(ca.id)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/70 transition-all mt-0.5 shrink-0"><X size={12} /></button>
          </div>
        ))}
        {total === 0 && <p className="text-[11px] text-white/25 text-center py-8">No items on canvas</p>}
      </div>
    </div>
  )
}

// ── Add Asset Panel ────────────────────────────────────────────────
function AddAssetPanel({ onClose, onUpload, onBrowseDAM }: { onClose: () => void; onUpload: (url: string, name: string) => void; onBrowseDAM: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onUpload(url, file.name)
    }
  }

  return (
    <div className="w-56 bg-[#0f0f0f] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <span className="text-xs font-semibold text-white">Add Asset</span>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={14} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">Upload File</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] border border-dashed border-white/15 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-white/30 hover:bg-white/[0.03] transition-all group">
            <Upload size={20} className="text-white/25 group-hover:text-white/50 transition-colors" />
            <div className="text-center">
              <p className="text-[11px] text-white/40 font-medium">Click to upload image</p>
              <p className="text-[10px] text-white/20 mt-0.5">PNG, JPG, SVG, WebP</p>
            </div>
          </button>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2">From Library</p>
          <button onClick={onBrowseDAM} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/10 transition-all text-left">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0"><BookOpen size={15} className="text-white/40" /></div>
            <div>
              <p className="text-[11px] font-medium text-white/70">Browse DAM</p>
              <p className="text-[10px] text-white/30 mt-0.5">Select from asset library</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Template Picker Panel ─────────────────────────────────────────
function TemplatePickerPanel({ onClose, onApply }: { onClose: () => void; onApply: (id: string) => void }) {
  const { templates } = useTemplateStore()
  return (
    <div className="w-56 bg-[#0f0f0f] flex flex-col shrink-0 border-l border-white/[0.07]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
        <div>
          <span className="text-xs font-semibold text-white">Use Template</span>
          <p className="text-[10px] text-white/30 mt-0.5">Apply bounding zones from a template</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={14} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {templates.length === 0 && <p className="text-[11px] text-white/25 text-center py-8">No saved templates</p>}
        {templates.map((t) => (
          <button key={t.id} onClick={() => onApply(t.id)} className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] hover:border-white/10 transition-all text-left group">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-black/40 shrink-0 border border-white/10">
              <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white/80 truncate leading-tight">{t.name}</p>
              <p className="text-[10px] text-white/30 mt-0.5">
                {t.boundingBoxes.length} zone{t.boundingBoxes.length !== 1 ? 's' : ''} · {t.originTool === 'KVGenerator' ? 'KV Gen' : 'Image Ed'}
              </p>
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 pb-3">
        <button onClick={() => window.open('/kv-generator/templates', '_blank')} className="w-full py-2 text-[11px] text-white/30 hover:text-white/60 border border-white/[0.07] rounded-xl transition-colors">
          Browse all templates →
        </button>
      </div>
    </div>
  )
}

// ── Instruction Queue Panel ───────────────────────────────────────
function InstructionQueuePanel({ onRegenerate, onOpenTemplatePicker, onBrowseDAM }: { onRegenerate: () => void; onOpenTemplatePicker: () => void; onBrowseDAM: () => void }) {
  const { instructions, activeInstructionId, setActiveInstruction, removeInstruction, updateInstruction, clearStaged, isRegenerating, regenProgress, session } = useImageEditorStore()
  const staged = instructions.filter((i) => i.status === 'Staged')
  const executed = instructions.filter((i) => i.status === 'Executed')

  return (
    <div className="w-72 bg-[#0f0f0f] border-l border-white/[0.07] flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-white/[0.07]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Instruction Queue</h3>
          <div className="flex items-center gap-2">
            <button onClick={onBrowseDAM} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors" title="Browse DAM">
              <BookOpen size={11} />
            </button>
            <button onClick={onOpenTemplatePicker} className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors" title="Use Template">
              <Layers size={11} /> Template
            </button>
            {staged.length > 0 && <button onClick={clearStaged} className="text-xs text-red-400/60 hover:text-red-400">Clear</button>}
          </div>
        </div>
        <p className="text-xs text-white/30 mt-0.5">{staged.length} staged · {executed.length} executed</p>
      </div>

      {staged.length > 10 && (
        <div className="mx-3 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 flex items-center gap-2 text-xs text-amber-400">
          <AlertTriangle size={12} /> More than 10 instructions — consider splitting into multiple jobs.
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {instructions.length === 0 ? (
          <div className="text-center py-10 text-white/20">
            <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">Draw a mask or use a tool to add instructions</p>
          </div>
        ) : (
          <>
            {staged.length > 0 && <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-1 pt-1">Staged</div>}
            {staged.map((instr) => (
              <InstructionRow key={instr.id} instr={instr} isActive={activeInstructionId === instr.id} onActivate={() => setActiveInstruction(instr.id)} onRemove={() => removeInstruction(instr.id)} onUpdate={(patch) => updateInstruction(instr.id, patch)} />
            ))}
            {executed.length > 0 && <div className="text-xs font-semibold text-white/30 uppercase tracking-wider px-1 pt-2">Executed</div>}
            {executed.map((instr) => (
              <InstructionRow key={instr.id} instr={instr} isActive={false} onActivate={() => {}} onRemove={() => removeInstruction(instr.id)} onUpdate={() => {}} dimmed />
            ))}
          </>
        )}
      </div>

      <div className="p-3 border-t border-white/[0.07]">
        {isRegenerating ? (
          <div>
            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <Loader2 size={12} className="animate-spin text-white/50" />
              <span>Processing... {Math.round(regenProgress)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${regenProgress}%` }} />
            </div>
          </div>
        ) : (
          <button
            onClick={onRegenerate}
            disabled={staged.length === 0 || !session.sourceImageUrl}
            className="w-full py-3 bg-white text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
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
      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${isActive ? 'border-white/20 bg-white/10' : dimmed ? 'border-white/[0.07] bg-white/[0.03] opacity-50' : 'border-white/[0.07] bg-white/[0.04] hover:border-white/20'}`}
    >
      <div className="flex items-start gap-2">
        {!dimmed && <GripVertical size={12} className="text-white/20 mt-0.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${instr.status === 'Staged' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'}`}>{instr.status}</span>
            {instr.isStatic && <Lock size={10} className="text-violet-500" />}
          </div>
          {editing ? (
            <input autoFocus value={instr.prompt} onChange={(e) => onUpdate({ prompt: e.target.value })} onBlur={() => setEditing(false)} onClick={(e) => e.stopPropagation()} className="w-full text-xs border border-white/20 bg-white/5 rounded px-2 py-1 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40" />
          ) : (
            <p className="text-xs text-white/60 line-clamp-2">{instr.prompt || <span className="text-white/20 italic">No prompt yet</span>}</p>
          )}
          {instr.type === 'Text' && instr.content && <p className="text-xs text-white/30 mt-0.5 truncate">"{instr.content}"</p>}
        </div>
        <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!dimmed && (
            <button onClick={() => setEditing(!editing)} className="p-1 text-white/30 hover:text-white/70 rounded">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            </button>
          )}
          <button onClick={onRemove} className="p-1 text-white/30 hover:text-red-400 rounded"><X size={11} /></button>
        </div>
      </div>
    </div>
  )
}

// ── Inline prompt popover ─────────────────────────────────────────
function InlinePromptInput({ type, onConfirm, onCancel, initialPrompt = '', initialContent = '', initialFillHint = '' }: {
  type: InstructionType
  onConfirm: (data: { prompt: string; content?: string; fillHint?: string }) => void
  onCancel: () => void
  initialPrompt?: string
  initialContent?: string
  initialFillHint?: string
}) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [content, setContent] = useState(initialContent)
  const [fillHint, setFillHint] = useState(initialFillHint)

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-frnd-dark rounded-xl shadow-2xl border border-white/10 p-4 z-30">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${INSTR_CONFIG[type].bgColor} ${INSTR_CONFIG[type].color}`}>{INSTR_CONFIG[type].label}</span>
        <button onClick={onCancel}><X size={14} className="text-white/30" /></button>
      </div>
      {type === 'Text' && (
        <div className="mb-2">
          <label className="block text-xs text-white/40 mb-1">Text content</label>
          <input value={content} onChange={(e) => setContent(e.target.value)} placeholder='What should the text say?' className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/30 mb-2" autoFocus />
          <label className="block text-xs text-white/40 mb-1">Style prompt</label>
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='e.g. bold white sans-serif, top-center' className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/30" />
        </div>
      )}
      {type === 'Erase' && (
        <div className="mb-2">
          <label className="block text-xs text-white/40 mb-1">Optional fill hint</label>
          <input value={fillHint} onChange={(e) => setFillHint(e.target.value)} placeholder='e.g. fill with blue gradient background' className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:border-white/30" autoFocus />
          <p className="text-xs text-white/25 mt-1">Leave blank for content-aware deletion</p>
        </div>
      )}
      {(type === 'InPaint' || type === 'AssetOverlay') && (
        <div className="mb-2">
          <label className="block text-xs text-white/40 mb-1">{type === 'InPaint' ? 'Prompt for this region' : 'Blend instruction'}</label>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder={type === 'InPaint' ? 'e.g. replace with warm sunset gradient' : 'e.g. blend naturally as product showcase'} className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 resize-none focus:outline-none focus:border-white/30" autoFocus />
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={onCancel} className="flex-1 py-1.5 text-xs text-white/40 bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
        <button
          onClick={() => (type === 'Text' ? content.trim() : type === 'Erase' ? true : prompt.trim()) && onConfirm({ prompt, content, fillHint })}
          className="flex-1 py-1.5 text-xs font-medium text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors"
        >
          {initialPrompt || initialContent || initialFillHint ? 'Save Changes' : 'Add to Queue'}
        </button>
      </div>
    </div>
  )
}

// ── Regen thumbs ──────────────────────────────────────────────────
const REGEN_THUMBS = [
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1593672715438-d88a70629abe?w=600&h=600&fit=crop',
]

// ── Main Canvas Page ──────────────────────────────────────────────
export default function ImageEditorCanvasPage() {
  const navigate = useNavigate()
  const {
    session, activeTool, setActiveTool,
    drawingMask, setDrawingMask, canvasMasks, addCanvasMask, removeCanvasMask,
    instructions, addInstruction, updateInstruction, removeInstruction, clearStaged,
    isRegenerating, regenProgress, startRegen, tickRegen, completeRegen,
    setExporting, returnTo,
  } = useImageEditorStore()
  const { saveTemplate } = useTemplateStore()

  const [showHistory, setShowHistory] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showDAMBrowser, setShowDAMBrowser] = useState(false)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [pendingMask, setPendingMask] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const [pendingInstrType, setPendingInstrType] = useState<InstructionType | null>(null)
  const [showInlinePrompt, setShowInlinePrompt] = useState(false)
  const [editingInstrId, setEditingInstrId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)

  // Canvas asset state
  const [canvasAssets, setCanvasAssets] = useState<CanvasAsset[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)
  const [editAssetPrompt, setEditAssetPrompt] = useState('')
  const [pendingAssetPos, setPendingAssetPos] = useState<{ x: number; y: number } | null>(null)

  const dragStateRef = useRef<{ assetId: string; startMX: number; startMY: number; startX: number; startY: number } | null>(null)
  const rotateStateRef = useRef<{ assetId: string; centerX: number; centerY: number; startAngle: number; startRotation: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)
  const regenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentImage = session.sourceImageUrl

  // Global mouse handlers for drag & rotate
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragStateRef.current) {
        const { assetId, startMX, startMY, startX, startY } = dragStateRef.current
        const canvasEl = document.getElementById('ie-canvas')
        if (!canvasEl) return
        const rect = canvasEl.getBoundingClientRect()
        const dx = ((e.clientX - startMX) / rect.width) * 100
        const dy = ((e.clientY - startMY) / rect.height) * 100
        setCanvasAssets((prev) =>
          prev.map((a) =>
            a.id === assetId
              ? { ...a, x: Math.max(-a.w / 2, Math.min(100 - a.w / 2, startX + dx)), y: Math.max(-a.h / 2, Math.min(100 - a.h / 2, startY + dy)) }
              : a
          )
        )
      }
      if (rotateStateRef.current) {
        const { assetId, centerX, centerY, startAngle, startRotation } = rotateStateRef.current
        const canvasEl = document.getElementById('ie-canvas')
        if (!canvasEl) return
        const rect = canvasEl.getBoundingClientRect()
        const cx = rect.left + (centerX / 100) * rect.width
        const cy = rect.top + (centerY / 100) * rect.height
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI) + 90
        const delta = angle - startAngle
        const newRotation = ((startRotation + delta) % 360 + 360) % 360
        setCanvasAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, rotation: newRotation } : a)))
      }
    }
    const handleMouseUp = () => {
      dragStateRef.current = null
      rotateStateRef.current = null
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  if (!currentImage) {
    return (
      <div className="flex items-center justify-center h-full bg-[#111]">
        <div className="text-center">
          <p className="text-white/40 mb-3">No image loaded.</p>
          <button onClick={() => navigate('/image-editor')} className="text-sm text-white/60 hover:text-white underline transition-colors">← Back to Image Editor</button>
        </div>
      </div>
    )
  }

  const tools = [
    { id: 'rectangle', icon: <Square size={16} />, tip: 'Rectangle Mask' },
    { id: 'freehand', icon: <Lasso size={16} />, tip: 'Freehand Mask' },
    { id: 'text', icon: <Type size={16} />, tip: 'Add Text' },
    { id: 'erase', icon: <Eraser size={16} />, tip: 'Erase Region' },
    { id: 'overlay', icon: <ImageIcon size={16} />, tip: 'Asset Overlay' },
    { id: 'move', icon: <MousePointer2 size={16} />, tip: 'Move / Select' },
  ]

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
    if (activeTool === 'overlay') {
      const { x, y } = getCanvasCoords(e)
      setPendingAssetPos({ x, y })
      setPendingMask({ x: Math.max(0, x - 20), y: Math.max(0, y - 20), width: 40, height: 40 })
      setPendingInstrType('AssetOverlay')
      setShowInlinePrompt(true)
      return
    }
    e.preventDefault()
    const { x, y } = getCanvasCoords(e)
    drawStartRef.current = { x, y }
    const drawShape: MaskShape = (activeTool === 'rectangle' || activeTool === 'freehand') ? activeTool : 'rectangle'
    setDrawingMask({ shape: drawShape, x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawStartRef.current || !activeTool || activeTool === 'move' || activeTool === 'text' || activeTool === 'overlay') return
    const { x, y } = getCanvasCoords(e)
    const drawShape: MaskShape = (activeTool === 'rectangle' || activeTool === 'freehand') ? activeTool : 'rectangle'
    setDrawingMask({ shape: drawShape, x: Math.min(drawStartRef.current.x, x), y: Math.min(drawStartRef.current.y, y), width: Math.abs(x - drawStartRef.current.x), height: Math.abs(y - drawStartRef.current.y) })
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
    if (editingInstrId) {
      updateInstruction(editingInstrId, { prompt, content: content || undefined, fillHint: fillHint || undefined })
      setEditingInstrId(null)
      setShowInlinePrompt(false)
      return
    }
    if (!pendingMask || !pendingInstrType) return
    const label = pendingInstrType === 'Text' ? `Text: "${content?.slice(0, 20)}"` : `${INSTR_CONFIG[pendingInstrType].label} region`
    const instrId = addInstruction({
      type: pendingInstrType, label, prompt,
      content: content || undefined, fillHint: fillHint || undefined,
      mask: { shape: (activeTool === 'rectangle' || activeTool === 'freehand') ? activeTool : 'rectangle', ...pendingMask },
    })
    if (pendingInstrType !== 'Text') {
      addCanvasMask({ instructionId: instrId, shape: (activeTool === 'rectangle' || activeTool === 'freehand') ? activeTool : 'rectangle', ...pendingMask })
    }
    setShowInlinePrompt(false)
    setPendingMask(null)
    setPendingInstrType(null)
  }

  const handleApplyTemplate = (templateId: string) => {
    const template = useTemplateStore.getState().getTemplate(templateId)
    if (!template) return
    template.boundingBoxes.forEach((box) => {
      const mask = { shape: 'rectangle' as const, x: box.x, y: box.y, width: box.width, height: box.height }
      const instrId = addInstruction({ type: 'InPaint', label: box.label, prompt: box.description, mask })
      addCanvasMask({ instructionId: instrId, ...mask })
    })
    setShowTemplatePicker(false)
  }

  const handleAddAsset = (assets: { id: string; name: string; url: string; thumbnailUrl: string }[]) => {
    const pos = pendingAssetPos ?? { x: 40, y: 40 }
    const newAssets: CanvasAsset[] = assets.map((a) => ({
      id: `ca-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: a.name,
      url: a.url,
      thumbnailUrl: a.thumbnailUrl,
      x: Math.max(0, pos.x - 10),
      y: Math.max(0, pos.y - 10),
      w: 20,
      h: 20,
      rotation: 0,
      prompt: '',
    }))
    setCanvasAssets((prev) => [...prev, ...newAssets])
    if (newAssets.length > 0) setSelectedAssetId(newAssets[newAssets.length - 1].id)
    setPendingAssetPos(null)
    setShowDAMBrowser(false)
    setShowAddAsset(false)
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

  const handleClearAll = () => {
    clearStaged()
    canvasMasks.forEach((m) => removeCanvasMask(m.instructionId))
  }

  const stagedCount = instructions.filter((i) => i.status === 'Staged').length

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden bg-[#111]">

      {/* ── Top toolbar ─────────────────────────────────────────── */}
      <header className="h-12 shrink-0 bg-[#0f0f0f] border-b border-white/[0.07] flex items-center px-4 gap-2">
        <button
          onClick={() => navigate(returnTo?.path || '/image-editor')}
          className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mr-1"
        >
          <ArrowLeft size={15} /> Back
        </button>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-sm font-medium text-white ml-1">Image Editor</span>

        {session.brandEnabled && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400 font-medium ml-2">
            <Lock size={10} /> CIMB Brand Active
          </div>
        )}

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button title="Undo" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"><Undo2 size={14} /></button>
        <button title="Redo" className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"><Redo2 size={14} /></button>

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/[0.08] rounded-lg px-2.5 h-8 text-xs text-white/50 select-none">
          <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="hover:text-white transition-colors">—</button>
          <span className="w-10 text-center text-white/60 font-medium">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="hover:text-white transition-colors">+</button>
        </div>

        {/* History */}
        <button onClick={() => setShowHistory(!showHistory)} title="Version History" className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showHistory ? 'bg-white/15 text-white' : 'text-white/30 hover:text-white hover:bg-white/10'}`}>
          <History size={14} />
        </button>

        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Save Template */}
        <button onClick={() => setShowSaveTemplate(true)} className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-white/60 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all">
          <Save size={12} /> Save Template
        </button>

        {/* Download */}
        <button
          onClick={() => {
            if (currentImage) {
              const a = document.createElement('a')
              a.href = currentImage
              a.download = `image-editor-${Date.now()}.jpg`
              a.click()
            }
          }}
          disabled={!currentImage}
          className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-white/60 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
        >
          <Download size={12} /> Download
        </button>

        {/* Export */}
        <button onClick={() => setShowExport(true)} className="flex items-center gap-1.5 px-3 h-8 text-xs font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
          <Maximize2 size={12} /> Export
        </button>
      </header>

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left toolbar */}
        <aside className="w-11 bg-[#0f0f0f] border-r border-white/[0.07] flex flex-col items-center py-3 gap-1 shrink-0">
          {tools.map((t, i) => (
            <div key={t.id} className="flex flex-col items-center w-full">
              {i === 4 && <div className="w-6 h-px bg-white/10 my-1.5" />}
              <button
                onClick={() => {
                  if (t.id === 'overlay') {
                    setActiveTool('overlay')
                    setShowAddAsset(true)
                  } else {
                    setActiveTool(t.id === activeTool ? null : t.id as 'rectangle' | 'freehand' | 'text' | 'erase' | 'overlay' | 'move')
                  }
                }}
                title={t.tip}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  activeTool === t.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/25 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {t.icon}
              </button>
            </div>
          ))}
        </aside>

        {/* Canvas area */}
        <main className="flex-1 bg-[#111] flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center relative overflow-hidden p-6">
            {isRegenerating && (
              <div className="absolute inset-0 bg-black/80 z-10 flex flex-col items-center justify-center">
                <Loader2 size={32} className="text-white animate-spin mb-3" />
                <p className="text-white font-medium mb-3 text-sm">Executing instruction queue...</p>
                <div className="w-56 bg-white/20 rounded-full h-1.5">
                  <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${regenProgress}%` }} />
                </div>
                <p className="text-white/50 text-xs mt-2">{Math.round(regenProgress)}%</p>
              </div>
            )}

            <div
              id="ie-canvas"
              ref={canvasRef}
              className={`relative bg-black shadow-2xl rounded-lg overflow-hidden select-none shrink-0 ${activeTool && activeTool !== 'move' ? 'cursor-crosshair' : 'cursor-default'}`}
              style={{
                width: `calc(min(65vh, 560px) * ${zoom / 100})`,
                height: `calc(min(65vh, 560px) * ${zoom / 100})`,
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {currentImage && <img src={currentImage} alt="Canvas" className="w-full h-full object-cover pointer-events-none" />}

              {/* Canvas assets (draggable + rotatable) */}
              {canvasAssets.map((ca) => {
                const isSelected = selectedAssetId === ca.id
                return (
                  <div key={ca.id} className="absolute select-none" style={{ left: `${ca.x}%`, top: `${ca.y}%`, width: `${ca.w}%`, height: `${ca.h}%` }}>
                    <div
                      id={`ie-asset-${ca.id}`}
                      className="relative w-full h-full"
                      style={{ transform: `rotate(${ca.rotation}deg)`, transformOrigin: 'center center', cursor: isSelected ? 'grabbing' : 'grab' }}
                      onDoubleClick={(e) => { e.stopPropagation(); setEditingAssetId(ca.id); setEditAssetPrompt(ca.prompt) }}
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setSelectedAssetId(ca.id)
                        dragStateRef.current = { assetId: ca.id, startMX: e.clientX, startMY: e.clientY, startX: ca.x, startY: ca.y }
                      }}
                    >
                      <img src={ca.thumbnailUrl || ca.url} alt={ca.name} className="w-full h-full object-cover rounded-sm pointer-events-none" draggable={false} />
                      {isSelected && <div className="absolute inset-0 border-2 border-cyan-400 rounded-sm pointer-events-none" />}
                    </div>
                    {isSelected && (
                      <>
                        <div
                          className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"
                          style={{ cursor: 'grab' }}
                          onMouseDown={(e) => {
                            e.stopPropagation()
                            const canvasEl = document.getElementById('ie-canvas')
                            const assetEl = document.getElementById(`ie-asset-${ca.id}`)
                            if (!canvasEl || !assetEl) return
                            const canvasRect = canvasEl.getBoundingClientRect()
                            const assetRect = assetEl.getBoundingClientRect()
                            const cxPx = assetRect.left + assetRect.width / 2
                            const cyPx = assetRect.top + assetRect.height / 2
                            rotateStateRef.current = {
                              assetId: ca.id,
                              centerX: ((cxPx - canvasRect.left) / canvasRect.width) * 100,
                              centerY: ((cyPx - canvasRect.top) / canvasRect.height) * 100,
                              startAngle: Math.atan2(e.clientY - cyPx, e.clientX - cxPx) * (180 / Math.PI) + 90,
                              startRotation: ca.rotation,
                            }
                          }}
                        >
                          <div className="w-5 h-5 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
                          </div>
                          <div className="w-px h-3 bg-cyan-400/60" />
                        </div>
                        <button
                          className="absolute -top-2.5 -right-2.5 z-10 w-5 h-5 rounded-full bg-red-500 border border-white flex items-center justify-center shadow-lg hover:bg-red-400 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setCanvasAssets((prev) => prev.filter((a) => a.id !== ca.id)); setSelectedAssetId(null) }}
                        >
                          <X size={10} />
                        </button>
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded bg-black/70 border border-cyan-500/40 text-[9px] text-cyan-300 font-mono whitespace-nowrap pointer-events-none">
                          {Math.round(ca.rotation)}°
                        </div>
                      </>
                    )}
                  </div>
                )
              })}

              {/* Canvas masks */}
              {canvasMasks.map((mask) => {
                const instrType = instructions.find((i) => i.id === mask.instructionId)?.type || 'InPaint'
                const colorMap: Record<InstructionType, string> = { InPaint: 'border-blue-400 bg-blue-400/10', Text: 'border-violet-500 bg-violet-400/10', Erase: 'border-red-400 bg-red-400/10', AssetOverlay: 'border-green-400 bg-green-400/10' }
                return (
                  <div key={mask.instructionId}
                    className={`absolute border-2 ${colorMap[instrType]} rounded`}
                    style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: `${mask.width}%`, height: `${mask.height}%` }}
                  >
                    <button onClick={(e) => { e.stopPropagation(); removeCanvasMask(mask.instructionId) }} className="absolute -top-2.5 -right-2.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <X size={9} />
                    </button>
                  </div>
                )
              })}

              {/* Drawing preview */}
              {drawingMask && drawingMask.width > 0 && (
                <div
                  className="absolute border-2 border-dashed border-white/60 bg-white/5 pointer-events-none"
                  style={{ left: `${drawingMask.x}%`, top: `${drawingMask.y}%`, width: `${drawingMask.width}%`, height: `${drawingMask.height}%` }}
                />
              )}

              {/* Brand locked indicator */}
              {session.brandEnabled && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded px-2 py-1 flex items-center gap-1">
                  <Lock size={10} className="text-white/60" />
                  <span className="text-xs text-white/60 font-medium">Brand assets locked</span>
                </div>
              )}
            </div>

            {/* Asset prompt inline editor */}
            {editingAssetId && (() => {
              const asset = canvasAssets.find((a) => a.id === editingAssetId)
              if (!asset) return null
              return (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-frnd-dark rounded-xl shadow-2xl border border-white/10 p-4 z-30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2 py-0.5 rounded font-medium bg-green-500/20 text-green-400">Asset Prompt</span>
                    <button onClick={() => setEditingAssetId(null)}><X size={14} className="text-white/30" /></button>
                  </div>
                  <label className="block text-xs text-white/40 mb-1">AI blend instruction</label>
                  <textarea value={editAssetPrompt} onChange={(e) => setEditAssetPrompt(e.target.value)} rows={2} placeholder="e.g. blend naturally as product showcase" className="w-full px-2 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 resize-none focus:outline-none focus:border-cyan-500/50 mb-3" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingAssetId(null)} className="flex-1 py-1.5 text-xs text-white/40 bg-white/10 rounded-lg hover:bg-white/20">Cancel</button>
                    <button onClick={() => { setCanvasAssets((prev) => prev.map((a) => a.id === editingAssetId ? { ...a, prompt: editAssetPrompt } : a)); setEditingAssetId(null) }} className="flex-1 py-1.5 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-500">
                      Save Prompt
                    </button>
                  </div>
                </div>
              )
            })()}

            {/* Inline prompt input — create or edit mode */}
            {showInlinePrompt && (() => {
              const editingInstr = editingInstrId ? instructions.find((i) => i.id === editingInstrId) : null
              const effectiveType = editingInstr ? editingInstr.type : pendingInstrType!
              return (
                <InlinePromptInput
                  key={editingInstrId ?? 'new'}
                  type={effectiveType}
                  onConfirm={handleConfirmInstruction}
                  onCancel={() => {
                    setShowInlinePrompt(false)
                    setPendingMask(null)
                    setPendingInstrType(null)
                    setEditingInstrId(null)
                  }}
                  initialPrompt={editingInstr?.prompt ?? ''}
                  initialContent={editingInstr?.content ?? ''}
                  initialFillHint={editingInstr?.fillHint ?? ''}
                />
              )
            })()}

            {/* Tool hint */}
            {activeTool && !showInlinePrompt && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-frnd-dark text-white text-xs px-3 py-2 rounded-full pointer-events-none border border-white/10">
                {(activeTool === 'rectangle' || activeTool === 'freehand') && 'Click and drag to draw mask'}
                {activeTool === 'text' && 'Click canvas to place text'}
                {activeTool === 'erase' && 'Draw over region to erase'}
                {activeTool === 'overlay' && 'Click to place asset overlay'}
                {activeTool === 'move' && 'Select / Move tool active'}
              </div>
            )}

            {showHistory && <VersionPanel onClose={() => setShowHistory(false)} />}
          </div>

          {/* Bottom actions */}
          <div className="shrink-0 pb-5 flex items-center justify-center gap-3">
            <button onClick={handleClearAll} className="px-5 py-2.5 text-sm font-medium text-white/60 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">
              Clear All
            </button>
            <button
              onClick={handleRegenerate}
              disabled={stagedCount === 0 || !session.sourceImageUrl || isRegenerating}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isRegenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Regenerate{stagedCount > 0 ? ` (${stagedCount})` : ''}
            </button>
          </div>

          {/* Status bar */}
          <div className="shrink-0 h-7 px-4 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[10px] text-white/20">Drag to move · rotate handle to spin · double click to edit prompt</span>
            <span className="text-[10px] text-white/20">{canvasAssets.length} asset(s) on canvas</span>
          </div>
        </main>

        {/* Right aside */}
        <aside className="flex border-l border-white/[0.07] shrink-0">
          <CanvasItemsPanel
            sourceImageUrl={session.sourceImageUrl}
            instructions={instructions}
            canvasAssets={canvasAssets}
            onRemoveInstruction={removeInstruction}
            onRemoveSource={() => {}}
            onRemoveCanvasAsset={(id) => setCanvasAssets((prev) => prev.filter((a) => a.id !== id))}
            onEditInstruction={(id) => {
              const instr = instructions.find((i) => i.id === id)
              if (!instr) return
              setEditingInstrId(id)
              setShowInlinePrompt(true)
            }}
          />
          {showAddAsset && (
            <AddAssetPanel
              onClose={() => setShowAddAsset(false)}
              onUpload={(url, name) => {
                const newAsset: CanvasAsset = {
                  id: `ca-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  name: name || 'uploaded-image',
                  url, thumbnailUrl: url,
                  x: 30, y: 30, w: 20, h: 20, rotation: 0, prompt: '',
                }
                setCanvasAssets((prev) => [...prev, newAsset])
                setSelectedAssetId(newAsset.id)
                setShowAddAsset(false)
              }}
              onBrowseDAM={() => setShowDAMBrowser(true)}
            />
          )}
          {showTemplatePicker && (
            <TemplatePickerPanel onClose={() => setShowTemplatePicker(false)} onApply={handleApplyTemplate} />
          )}
          {!showAddAsset && !showTemplatePicker && (
            <div className="w-8 bg-[#0f0f0f] border-l border-white/[0.07] flex flex-col items-center py-3 gap-4">
              <button onClick={() => setShowAddAsset(true)} className="text-white/20 hover:text-white/50 transition-colors" title="Add Asset"><Plus size={14} /></button>
              <button onClick={() => setShowTemplatePicker(true)} className="text-white/20 hover:text-white/50 transition-colors" title="Use Template"><Layers size={14} /></button>
            </div>
          )}
          <InstructionQueuePanel
            onRegenerate={handleRegenerate}
            onOpenTemplatePicker={() => setShowTemplatePicker((v) => !v)}
            onBrowseDAM={() => setShowDAMBrowser(true)}
          />
        </aside>
      </div>

      {/* Modals */}
      {showSaveTemplate && (
        <SaveTemplateModal
          onClose={() => setShowSaveTemplate(false)}
          onSave={(name, description) => saveTemplate(name, 'ImageEditor', currentImage, false, description)}
          previewImageUrl={currentImage}
        />
      )}
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} onExport={() => setExporting(true)} />
      )}
      <DAMBrowserModal
        isOpen={showDAMBrowser}
        onClose={() => setShowDAMBrowser(false)}
        onAdd={handleAddAsset}
      />
    </div>
  )
}
