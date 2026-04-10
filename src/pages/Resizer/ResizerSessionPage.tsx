import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, Check, Loader2, PenTool, ChevronRight, Copy, Link2, ArrowLeft, Save, X } from 'lucide-react'
import { useResizerStore } from '../../store/useResizerStore'
import { useImageEditorStore } from '../../store/useImageEditorStore'
import { useExportStore } from '../../store/useExportStore'
import { useTemplateStore } from '../../store/useTemplateStore'
import { mockDimensions } from '../../mock'
import type { DimensionProfile, DimensionPlatform, DimensionOrientation, FileNaming } from '../../types'

const PLATFORMS: { id: DimensionPlatform; label: string; icon: string }[] = [
  { id: 'Meta',         label: 'Meta',         icon: '📘' },
  { id: 'TikTok',       label: 'TikTok',        icon: '🎵' },
  { id: 'Owned Socmed', label: 'Owned Socmed',  icon: '📱' },
  { id: 'App & Web',    label: 'App & Web',     icon: '🖥' },
  { id: 'Google',       label: 'Google',        icon: '🔍' },
]
const ORIENTATIONS: DimensionOrientation[] = ['Square', 'Horizontal', 'Vertical']

function getDimsByPlatform(platformId: DimensionPlatform): DimensionProfile[] {
  return mockDimensions.filter((d) => d.platform === platformId)
}
function buildFilename(naming: FileNaming, dim: DimensionProfile) {
  const parts = [naming.campaign || 'Campaign', naming.segment || 'Segment', `${dim.width}x${dim.height}`, naming.version || 'v1']
  return parts.join('_').replace(/\s+/g, '') + '.png'
}

const ORIENT_COLORS: Record<DimensionOrientation, string> = {
  Square: 'bg-blue-500/20 text-blue-400',
  Horizontal: 'bg-amber-500/20 text-amber-400',
  Vertical: 'bg-purple-500/20 text-purple-400',
}

function ShareLinkPanel({ projectId, imageUrl }: { projectId: string; imageUrl: string }) {
  const { generateShareLink } = useExportStore()
  const [expiryDays, setExpiryDays] = useState(7)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const link = generateShareLink('resizer-export', projectId, expiryDays, imageUrl)
    setGeneratedLink(`${window.location.origin}/share/${link.token}`)
  }

  const handleCopy = () => {
    if (!generatedLink) return
    navigator.clipboard.writeText(generatedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <select
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
          className="flex-1 px-2 py-1.5 text-xs border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-white/30"
        >
          {[7, 14, 30].map((d) => <option key={d} value={d} className="bg-frnd-dark">Expires in {d} days</option>)}
        </select>
        <button onClick={handleGenerate} className="px-3 py-1.5 bg-cimb-red text-white text-xs rounded-lg hover:bg-red-700 whitespace-nowrap transition-colors">
          Generate
        </button>
      </div>
      {generatedLink ? (
        <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2 border border-white/10">
          <span className="flex-1 text-xs text-gray-400 truncate font-mono">{generatedLink}</span>
          <button onClick={handleCopy} className="shrink-0 text-gray-500 hover:text-white transition-colors">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-600">No link generated yet — click Generate to create one.</p>
      )}
    </div>
  )
}

type Step = 'select' | 'preview' | 'complete'

export default function ResizerSessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, loadProject, saveProjectState } = useResizerStore()
  const { setReturnTo, createProject } = useImageEditorStore()
  const { saveTemplate: _saveTemplate } = useTemplateStore()

  const project = projects.find(p => p.id === id)

  useEffect(() => {
    loadProject(id || null)
  }, [id, loadProject])

  const [step, setStep] = useState<Step>('select')
  const [activePlatform, setActivePlatform] = useState<DimensionPlatform>('Meta')
  const [isExporting, setIsExporting] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [zoom, setZoom] = useState(100)

  if (!project) return (
    <div className="p-8 text-center text-white/40">Project not found</div>
  )

  const selectedDims = new Set(project.selectedDimIds)
  const toggleDim = (dimId: string) => {
    const s = new Set(selectedDims)
    if (s.has(dimId)) { s.delete(dimId) } else { s.add(dimId) }
    saveProjectState({ selectedDimIds: Array.from(s) })
  }
  const togglePlatformAll = (platformId: DimensionPlatform) => {
    const ids = getDimsByPlatform(platformId).map((d) => d.id)
    const allSelected = ids.every((i) => selectedDims.has(i))
    const s = new Set(selectedDims)
    if (allSelected) ids.forEach((i) => s.delete(i))
    else ids.forEach((i) => s.add(i))
    saveProjectState({ selectedDimIds: Array.from(s) })
  }
  const selectAll = () => { saveProjectState({ selectedDimIds: mockDimensions.map(d => d.id) }) }
  const deselectAll = () => { saveProjectState({ selectedDimIds: [] }) }

  const activeDims = getDimsByPlatform(activePlatform)
  const activePlatformAllSelected = activeDims.length > 0 && activeDims.every(d => selectedDims.has(d.id))
  const selectedDimList = mockDimensions.filter((d) => selectedDims.has(d.id))

  const handleEditInImageEditor = (dimId: string, imageUrl: string) => {
    createProject({
      name: `${project.name} - ${dimId} Retouch`,
      sourceImageUrl: imageUrl,
      sourceProjectId: project.id,
      sourceProjectName: project.name,
      brandEnabled: false,
    })
    setReturnTo({ path: `/resizer/projects/${project.id}`, label: 'Export Preview', dimId })
    navigate('/image-editor/edit')
  }

  const handleDownload = () => {
    setIsExporting(true)
    setTimeout(() => {
      setIsExporting(false)
      setStep('complete')
    }, 2000)
  }

  // ── Step: Select ───────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Toolbar header */}
        <div className="bg-[#0f0f0f] rounded-xl border border-white/[0.07] px-4 py-3 flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/resizer')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="w-px h-5 bg-white/10" />
          <div>
            <p className="text-sm font-semibold text-white">{project.name}</p>
            <p className="text-[11px] text-white/30">Select platforms &amp; sizes</p>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 25))} disabled={zoom <= 50} className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
              <span className="text-sm leading-none">−</span>
            </button>
            <span className="w-10 text-center text-xs font-mono text-white/60">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} disabled={zoom >= 200} className="w-6 h-6 rounded flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
              <span className="text-sm leading-none">+</span>
            </button>
          </div>
          <button
            onClick={() => setShowSaveTemplate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/60 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition-all"
          >
            <Save size={12} /> Save Template
          </button>
        </div>

        <div className="max-w-4xl mx-auto bg-[#0d0d0d] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Select Platforms &amp; Sizes</h2>
              <p className="text-xs text-gray-500 mt-0.5">Choose which platforms and dimensions to include in your export</p>
            </div>
          </div>

          <div className="flex gap-5">
            <div className="w-44 shrink-0 space-y-1">
              {PLATFORMS.map((p) => {
                const dims = getDimsByPlatform(p.id)
                const selectedCount = dims.filter((d) => selectedDims.has(d.id)).length
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePlatform(p.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${activePlatform === p.id ? 'bg-[#1a1a1a] text-white border border-white/20' : 'bg-[#111111] border border-white/5 text-gray-500 hover:bg-[#1a1a1a] hover:text-white'}`}
                  >
                    <span className="text-base">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.label}</p>
                      <p className={`text-xs ${activePlatform === p.id ? 'text-gray-400' : 'text-gray-600'}`}>{selectedCount}/{dims.length}</p>
                    </div>
                  </button>
                )
              })}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <button onClick={selectAll} className="w-full text-xs text-gray-600 hover:text-white text-left px-2 py-1 transition-colors">Select all</button>
                <button onClick={deselectAll} className="w-full text-xs text-gray-600 hover:text-white text-left px-2 py-1 transition-colors">Deselect all</button>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{PLATFORMS.find(p => p.id === activePlatform)?.label}</span>
                  <span className="text-xs text-gray-500">{activeDims.filter(d => selectedDims.has(d.id)).length} of {activeDims.length} selected</span>
                </div>
                <button
                  onClick={() => togglePlatformAll(activePlatform)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${activePlatformAllSelected ? 'bg-[#1a1a1a] text-white border-white/20' : 'border-white/10 text-gray-500 hover:bg-[#1a1a1a] hover:text-white'}`}
                >
                  {activePlatformAllSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="space-y-4">
                {ORIENTATIONS.map((orient) => {
                  const dims = activeDims.filter((d) => d.orientation === orient)
                  if (dims.length === 0) return null
                  return (
                    <div key={orient}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{orient}</p>
                      <div className="grid grid-cols-3 gap-2">
                        {dims.map((dim) => {
                          const sel = selectedDims.has(dim.id)
                          return (
                            <button
                              key={dim.id}
                              onClick={() => toggleDim(dim.id)}
                              className={`p-2.5 rounded-lg border-2 text-left transition-all ${sel ? 'border-white/30 bg-[#1a1a1a]' : 'border-white/5 bg-[#111111] hover:border-white/20'}`}
                            >
                              <p className="text-xs font-medium text-white leading-tight">{dim.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{dim.width}×{dim.height}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${ORIENT_COLORS[dim.orientation]}`}>{dim.orientation.charAt(0)}</span>
                                {sel && <Check size={10} className="text-gray-400" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-gray-500"><span className="font-semibold text-white">{selectedDims.size}</span> size{selectedDims.size !== 1 ? 's' : ''} selected</span>
            <button
              onClick={() => setStep('preview')}
              disabled={selectedDims.size === 0}
              className="py-4 px-10 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 tracking-wide shadow-lg shadow-white/10 transition-colors"
            >
              Resize now <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* SaveTemplateModal */}
        {showSaveTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-frnd-dark rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h3 className="font-semibold text-white">Save as Template</h3>
                <button onClick={() => setShowSaveTemplate(false)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"><X size={16} /></button>
              </div>
              <div className="px-5 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Template Name</label>
                  <input placeholder="e.g. Meta Ad Sizes — Square" className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea rows={2} placeholder="Describe this resize template..." className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-white/30 transition-all" />
                </div>
                <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-xs text-white/40">Sizes</span>
                  <span className="text-xs font-medium text-white/70">{selectedDims.size} dimensions</span>
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <button onClick={() => setShowSaveTemplate(false)} className="flex-1 py-2.5 text-sm text-white/50 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all">Cancel</button>
                <button onClick={() => setShowSaveTemplate(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-colors">Save Template</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Step: Preview ──────────────────────────────────────────────
  if (step === 'preview') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Export Preview: {project.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Review {selectedDimList.length} selected size{selectedDimList.length !== 1 ? 's' : ''} before downloading</p>
          </div>
          <button onClick={() => setStep('select')} className="text-sm text-gray-500 hover:text-white transition-colors">← Back to Size Selection</button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            {/* Preview grid */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Resized Output Preview</h3>
                <span className="text-xs text-gray-500">{selectedDimList.length} sizes</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {selectedDimList.map((dim) => {
                  const aspectRatio = dim.height / dim.width
                  const imageUrl = project.editedTileImages[dim.id] || project.sourceImageUrl
                  const isEdited = !!project.editedTileImages[dim.id]
                  return (
                    <div key={dim.id} className="rounded-xl border border-white/10 overflow-hidden bg-black/20">
                      <div className="relative bg-black/40 overflow-hidden" style={{ paddingBottom: `${Math.min(aspectRatio * 100, 120)}%` }}>
                        {imageUrl && <img src={imageUrl} alt={dim.label} className="absolute inset-0 w-full h-full object-cover" />}
                        {isEdited && (
                          <div className="absolute top-1.5 left-1.5 bg-green-500/90 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={9} /> Edited
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 bg-white/5 space-y-2">
                        <div>
                          <p className="text-xs font-medium text-white">{dim.label}</p>
                          <p className="text-xs text-gray-500">{dim.width}×{dim.height} · {dim.estimatedSize}</p>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-gray-400">{dim.platform} · {dim.orientation}</span>
                        </div>
                        <button
                          onClick={() => handleEditInImageEditor(dim.id, imageUrl!)}
                          className="w-full py-1.5 bg-white/10 border border-white/20 text-gray-300 text-xs font-medium rounded-lg hover:bg-white/20 flex items-center justify-center gap-1 transition-colors"
                        >
                          <PenTool size={10} /> {isEdited ? 'Re-edit in Image Editor' : 'Edit in Image Editor'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Naming convention */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Export Naming Convention</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { key: 'campaign' as const, label: 'Project Name', placeholder: 'e.g. RamadanPromo' },
                  { key: 'segment' as const, label: 'Segment', placeholder: 'e.g. Youth' },
                  { key: 'version' as const, label: 'Version', placeholder: 'v1' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-white/40 mb-1 uppercase tracking-wider">{f.label}</label>
                    <input
                      value={project.naming[f.key]}
                      onChange={(e) => saveProjectState({ naming: { ...project.naming, [f.key]: e.target.value } })}
                      placeholder={f.placeholder}
                      className="w-full px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
                {selectedDimList.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-2">
                    <Check size={11} className="text-green-400 shrink-0" />
                    {buildFilename(project.naming, d)}
                  </div>
                ))}
                {selectedDimList.length > 3 && <div className="text-gray-600">...and {selectedDimList.length - 3} more</div>}
              </div>
              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs font-medium text-white/50">ZIP Structure:</span>
                {(['flat', 'grouped'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => saveProjectState({ zipStructure: m })}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${project.zipStructure === m ? 'bg-[#1a1a1a] text-white border-white/20' : 'border-white/10 text-gray-500 hover:bg-[#1a1a1a] hover:text-white'}`}
                  >
                    {m === 'flat' ? 'Flat (all files)' : 'Grouped by category'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            {/* Download */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-white mb-1">Download Package</h3>
              <p className="text-xs text-gray-500 mb-4">{selectedDims.size} size{selectedDims.size !== 1 ? 's' : ''} · ZIP</p>
              <button onClick={handleDownload} disabled={isExporting} className="w-full py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                {isExporting ? <><Loader2 size={16} className="animate-spin" /> Compiling ZIP...</> : <><Download size={16} /> Download ZIP</>}
              </button>
            </div>

            {/* Share */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Link2 size={14} className="text-cimb-red" />
                <h3 className="font-semibold text-white text-sm">Share with client</h3>
                <span className="ml-auto text-xs bg-cimb-red/20 text-cimb-red px-2 py-0.5 rounded-full font-medium">Recommended</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">Generate a view-only link so the client can review without needing a frndOS account.</p>
              <ShareLinkPanel projectId={project.id} imageUrl={project.sourceImageUrl || ''} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step: Complete ─────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Export complete!</h2>
      <p className="text-sm text-gray-500 mb-8 font-mono">{selectedDimList.length} sizes (ZIP)</p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={14} className="text-cimb-red" />
          <h3 className="font-semibold text-white text-sm">Share with client</h3>
          <span className="ml-auto text-xs bg-cimb-red/20 text-cimb-red px-2 py-0.5 rounded-full font-medium">Recommended</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Generate a view-only link so the client can review without needing a frndOS account.</p>
        <ShareLinkPanel projectId={project.id} imageUrl={project.sourceImageUrl || ''} />
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/resizer')} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/70 text-sm font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all">
          Back to Dashboard
        </button>
        <button onClick={() => setStep('preview')} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/70 text-sm font-medium rounded-xl hover:bg-white/10 hover:text-white transition-all">
          View Sizes
        </button>
      </div>
    </div>
  )
}
