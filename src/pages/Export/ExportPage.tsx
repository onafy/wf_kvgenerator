import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Download, Link2, Copy, Check, Loader2, PenTool, ChevronRight, Maximize2 } from 'lucide-react'
import { useExportStore } from '../../store/useExportStore'
import { useGenerationStore } from '../../store/useGenerationStore'
import { useImageEditorStore } from '../../store/useImageEditorStore'
import { mockDimensions } from '../../mock'
import type { DimensionProfile, DimensionPlatform, DimensionOrientation } from '../../types'

// ── Types ──────────────────────────────────────────────────────────
type ExportStep = 'intent' | 'select' | 'preview' | 'complete'
type ExportIntent = 'original' | 'resize'

// ── Platform config ────────────────────────────────────────────────
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

function buildFilename(naming: { campaign: string; segment: string; version: string }, dim: DimensionProfile) {
  const parts = [naming.campaign || 'Campaign', naming.segment || 'Segment', `${dim.width}x${dim.height}`, naming.version || 'v1']
  return parts.join('_').replace(/\s+/g, '') + '.png'
}

// ── Shared: inline Share Link panel ───────────────────────────────
function ShareLinkPanel({ variantId, projectId, imageUrl }: { variantId: string; projectId: string; imageUrl?: string }) {
  const { generateShareLink } = useExportStore()
  const [expiryDays, setExpiryDays] = useState(7)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const link = generateShareLink(variantId, projectId, expiryDays, imageUrl)
    const url = `${window.location.origin}/share/${link.token}`
    setGeneratedLink(url)
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
          className="flex-1 px-2 py-1.5 text-xs border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:border-cimb-red/50"
        >
          {[7, 14, 30].map((d) => <option key={d} value={d} className="bg-frnd-dark">Expires in {d} days</option>)}
        </select>
        <button onClick={handleGenerate} className="px-3 py-1.5 bg-cimb-red text-white text-xs rounded-lg hover:bg-red-700 whitespace-nowrap">
          Generate
        </button>
      </div>
      {generatedLink ? (
        <div className="bg-white/5 rounded-lg p-2 flex items-center gap-2 border border-white/10">
          <span className="flex-1 text-xs text-gray-400 truncate font-mono">{generatedLink}</span>
          <button onClick={handleCopy} className="shrink-0 text-gray-500 hover:text-white">
            {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-600">No link generated yet — click Generate to create one.</p>
      )}
    </div>
  )
}

// ── Step 0: Export Intent Gate ─────────────────────────────────────
function IntentGate({ onSelect, onBack }: { onSelect: (intent: ExportIntent) => void; onBack: () => void }) {
  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-white mb-6 block">← Back</button>
      <h2 className="text-xl font-bold text-white mb-1">How do you want to export?</h2>
      <p className="text-sm text-gray-500 mb-8">Choose an option to continue.</p>

      <div className="space-y-3">
        <button
          onClick={() => onSelect('original')}
          className="w-full p-5 rounded-xl border border-white/10 text-left hover:border-cimb-red hover:bg-cimb-red/5 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-cimb-red/20 flex items-center justify-center shrink-0">
              <Download size={18} className="text-gray-400 group-hover:text-cimb-red" />
            </div>
            <div>
              <p className="font-semibold text-white mb-0.5">Download Original</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Download the image at its original resolution and dimensions — no resizing, ready in seconds.
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-cimb-red shrink-0 mt-1 ml-auto" />
          </div>
        </button>

        <button
          onClick={() => onSelect('resize')}
          className="w-full p-5 rounded-xl border border-white/10 text-left hover:border-cimb-red hover:bg-cimb-red/5 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 group-hover:bg-cimb-red/20 flex items-center justify-center shrink-0">
              <Maximize2 size={18} className="text-gray-400 group-hover:text-cimb-red" />
            </div>
            <div>
              <p className="font-semibold text-white mb-0.5">Resize for Platforms</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Choose platforms and sizes (Instagram, Facebook, TikTok, GDN) and download a ZIP with all selected dimensions.
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-600 group-hover:text-cimb-red shrink-0 mt-1 ml-auto" />
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Step 1: Platform & Size Selection ─────────────────────────────
function PlatformSizeStep({
  selectedDims,
  onSelectionChange,
  onNext,
  onBack,
}: {
  selectedDims: Set<string>
  onSelectionChange: (next: Set<string>) => void
  onNext: () => void
  onBack: () => void
}) {
  const [activePlatform, setActivePlatform] = useState<DimensionPlatform>('Meta')

  const toggleDim = (id: string) => {
    const s = new Set(selectedDims)
    s.has(id) ? s.delete(id) : s.add(id)
    onSelectionChange(s)
  }

  const togglePlatformAll = (platformId: DimensionPlatform) => {
    const ids = getDimsByPlatform(platformId).map((d) => d.id)
    const allSelected = ids.every((id) => selectedDims.has(id))
    const s = new Set(selectedDims)
    if (allSelected) ids.forEach((id) => s.delete(id))
    else ids.forEach((id) => s.add(id))
    onSelectionChange(s)
  }

  const selectAll = () => onSelectionChange(new Set(mockDimensions.map((d) => d.id)))
  const deselectAll = () => onSelectionChange(new Set())

  const activeDims = getDimsByPlatform(activePlatform)
  const activePlatformAllSelected = activeDims.length > 0 && activeDims.every((d) => selectedDims.has(d.id))

  const ORIENT_COLORS: Record<DimensionOrientation, string> = {
    Square: 'bg-blue-500/20 text-blue-400',
    Horizontal: 'bg-amber-500/20 text-amber-400',
    Vertical: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Select Platforms & Sizes</h2>
          <p className="text-sm text-gray-500 mt-0.5">Choose which platforms and dimensions to include in your export</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-white">← Back</button>
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
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${activePlatform === p.id ? 'bg-cimb-red text-white' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="text-base">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.label}</p>
                  <p className={`text-xs ${activePlatform === p.id ? 'text-red-200' : 'text-gray-600'}`}>{selectedCount}/{dims.length}</p>
                </div>
              </button>
            )
          })}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <button onClick={selectAll} className="w-full text-xs text-gray-500 hover:text-white text-left px-2 py-1">Select all</button>
            <button onClick={deselectAll} className="w-full text-xs text-gray-500 hover:text-white text-left px-2 py-1">Deselect all</button>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{PLATFORMS.find(p => p.id === activePlatform)?.label}</span>
              <span className="text-xs text-gray-600">{activeDims.filter(d => selectedDims.has(d.id)).length} of {activeDims.length} selected</span>
            </div>
            <button
              onClick={() => togglePlatformAll(activePlatform)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${activePlatformAllSelected ? 'bg-cimb-red text-white border-cimb-red' : 'border-white/20 text-gray-400 hover:border-white/40'}`}
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
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">{orient}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {dims.map((dim) => {
                      const sel = selectedDims.has(dim.id)
                      return (
                        <button
                          key={dim.id}
                          onClick={() => toggleDim(dim.id)}
                          className={`p-2.5 rounded-lg border-2 text-left transition-all ${sel ? 'border-cimb-red bg-cimb-red/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                        >
                          <p className="text-xs font-medium text-white leading-tight">{dim.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{dim.width}×{dim.height}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${ORIENT_COLORS[dim.orientation]}`}>{dim.orientation.charAt(0)}</span>
                            {sel && <Check size={10} className="text-cimb-red" />}
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
        <span className="text-sm text-gray-500"><span className="font-semibold text-white">{selectedDims.size}</span> size{selectedDims.size !== 1 ? 's' : ''} selected</span>
        <button
          onClick={onNext}
          disabled={selectedDims.size === 0}
          className="py-3 px-6 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
        >
          <ChevronRight size={18} /> Continue to Export Preview
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Export Preview (resize path) ──────────────────────────
function ExportPreviewStep({
  selectedDims,
  effectiveProjectId,
  onBack,
  onExportDone,
}: {
  selectedDims: Set<string>
  effectiveProjectId: string
  onBack: () => void
  onExportDone: (fileLabel: string) => void
}) {
  const navigate = useNavigate()
  const { naming, setNamingField, zipStructure, setZipStructure, isExporting, startExport, finishExport, editedTileImages } = useExportStore()
  const { getVariants } = useGenerationStore()
  const { setSourceImage, setReturnTo } = useImageEditorStore()
  const variants = getVariants(effectiveProjectId)
  const latestVariant = variants[variants.length - 1] || variants[0]

  const selectedDimList = mockDimensions.filter((d) => selectedDims.has(d.id))

  const handleDownload = () => {
    startExport()
    setTimeout(() => {
      finishExport(effectiveProjectId)
      onExportDone(`${selectedDimList.length} sizes (ZIP)`)
    }, 2000)
  }

  const handleEditInImageEditor = (dimId: string, imageUrl: string) => {
    const returnPath = `/kv-generator/projects/${effectiveProjectId}/export?intent=resize`
    setReturnTo({ path: returnPath, label: 'Export Preview', dimId })
    setSourceImage(imageUrl)
    navigate('/image-editor/edit')
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-white">Export Preview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Review {selectedDimList.length} selected size{selectedDimList.length !== 1 ? 's' : ''} before downloading</p>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-white">← Back to Size Selection</button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Resized Output Preview</h3>
              <span className="text-xs text-gray-600">{selectedDimList.length} sizes</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {selectedDimList.map((dim) => {
                const aspectRatio = dim.height / dim.width
                const baseUrl = latestVariant?.thumbnailUrl || ''
                const imageUrl = editedTileImages[dim.id] || baseUrl
                const isEdited = !!editedTileImages[dim.id]
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
                        onClick={() => handleEditInImageEditor(dim.id, imageUrl)}
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

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Export Naming Convention</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { key: 'campaign' as const, label: 'Project Name', placeholder: 'e.g. RamadanPromo' },
                { key: 'segment' as const, label: 'Segment', placeholder: 'e.g. Youth' },
                { key: 'version' as const, label: 'Version', placeholder: 'v1' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-400 mb-1">{f.label}</label>
                  <input value={naming[f.key]} onChange={(e) => setNamingField(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cimb-red/50" />
                </div>
              ))}
            </div>
            <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-gray-400 space-y-1">
              {selectedDimList.slice(0, 3).map((d) => (
                <div key={d.id} className="flex items-center gap-2">
                  <Check size={11} className="text-green-400 shrink-0" />
                  {buildFilename(naming, d)}
                </div>
              ))}
              {selectedDimList.length > 3 && <div className="text-gray-600">...and {selectedDimList.length - 3} more</div>}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-xs font-medium text-gray-400">ZIP Structure:</span>
              {(['flat', 'grouped'] as const).map((m) => (
                <button key={m} onClick={() => setZipStructure(m)} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${zipStructure === m ? 'bg-cimb-red text-white border-cimb-red' : 'border-white/20 text-gray-400 hover:border-white/40'}`}>
                  {m === 'flat' ? 'Flat (all files)' : 'Grouped by category'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
            <h3 className="font-semibold text-white mb-1">Download Package</h3>
            <p className="text-xs text-gray-500 mb-4">{selectedDims.size} size{selectedDims.size !== 1 ? 's' : ''} · ZIP</p>
            <button onClick={handleDownload} disabled={isExporting} className="w-full py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {isExporting ? <><Loader2 size={16} className="animate-spin" /> Compiling ZIP...</> : <><Download size={16} /> Download ZIP</>}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Link2 size={14} className="text-cimb-red" />
              <h3 className="font-semibold text-white text-sm">Share with client</h3>
              <span className="ml-auto text-xs bg-cimb-red/20 text-cimb-red px-2 py-0.5 rounded-full font-medium">Recommended</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Generate a view-only link now so the client can review without needing a frndOS account.</p>
            <ShareLinkPanel variantId={latestVariant?.id || 'export-preview'} projectId={effectiveProjectId} imageUrl={latestVariant?.thumbnailUrl} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 2b: Download Original ─────────────────────────────────────
function DownloadOriginalStep({
  effectiveProjectId,
  onBack,
  onExportDone,
}: {
  effectiveProjectId: string
  onBack: () => void
  onExportDone: (fileLabel: string) => void
}) {
  const { naming, setNamingField, isExporting, startExport, finishExport } = useExportStore()
  const { getVariants } = useGenerationStore()
  const variants = getVariants(effectiveProjectId)
  const latestVariant = variants[variants.length - 1] || variants[0]

  const handleDownload = () => {
    startExport()
    setTimeout(() => {
      finishExport(effectiveProjectId)
      onExportDone(`${naming.campaign || 'Campaign'}_original.png`)
    }, 1200)
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      <button onClick={onBack} className="text-sm text-gray-500 hover:text-white mb-6 block">← Back</button>
      <h2 className="text-xl font-bold text-white mb-1">Download Original</h2>
      <p className="text-sm text-gray-500 mb-6">Full resolution, no resizing applied.</p>

      {latestVariant && (
        <div className="bg-black/40 rounded-xl overflow-hidden mb-6 aspect-square">
          <img src={latestVariant.thumbnailUrl} alt="Original" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 space-y-3">
        <h3 className="text-sm font-semibold text-white">Filename</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'campaign' as const, label: 'Campaign', placeholder: 'e.g. RamadanPromo' },
            { key: 'version' as const, label: 'Version', placeholder: 'v1' },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1">{f.label}</label>
              <input value={naming[f.key]} onChange={(e) => setNamingField(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-2 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-cimb-red/50" />
            </div>
          ))}
        </div>
        <div className="bg-black/40 rounded-lg px-3 py-2 font-mono text-xs text-gray-400">
          {naming.campaign || 'Campaign'}_{naming.version || 'v1'}_original.png
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isExporting}
        className="w-full py-3.5 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 mb-6"
      >
        {isExporting ? <><Loader2 size={16} className="animate-spin" /> Downloading...</> : <><Download size={16} /> Download Original</>}
      </button>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={14} className="text-cimb-red" />
          <h3 className="font-semibold text-white text-sm">Share with client</h3>
          <span className="ml-auto text-xs bg-cimb-red/20 text-cimb-red px-2 py-0.5 rounded-full font-medium">Recommended</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Generate a view-only link now so the client can review without needing a frndOS account.</p>
        <ShareLinkPanel variantId={latestVariant?.id || 'export-original'} projectId={effectiveProjectId} imageUrl={latestVariant?.thumbnailUrl} />
      </div>
    </div>
  )
}

// ── Step 3: Export Complete ────────────────────────────────────────
function ExportCompleteStep({
  fileLabel,
  effectiveProjectId,
  onExportAgain,
}: {
  fileLabel: string
  effectiveProjectId: string
  onExportAgain: () => void
}) {
  const { shareLinks } = useExportStore()
  const { getVariants } = useGenerationStore()
  const variants = getVariants(effectiveProjectId)
  const latestVariant = variants[variants.length - 1] || variants[0]

  const latestLink = shareLinks.find((l) => l.projectId === effectiveProjectId && !l.isRevoked)

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <Check size={32} className="text-green-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">Export Complete</h2>
      <p className="text-sm text-gray-500 mb-6">{fileLabel} downloaded successfully.</p>

      {latestLink && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-2">Share link generated</p>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs text-gray-400 truncate font-mono">{window.location.origin}/share/{latestLink.token}</span>
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/share/${latestLink.token}`)}
              className="shrink-0 text-gray-500 hover:text-white"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button onClick={onExportAgain} className="w-full py-3 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/20 transition-colors">
          Export Again
        </button>
        <button onClick={() => window.location.href = '/kv-generator'} className="w-full py-3 text-gray-500 text-sm hover:text-white transition-colors">
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}

// ── Main Export Page ────────────────────────────────────────────────
export default function ExportPage() {
  const navigate = useNavigate()
  const { id: projectId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const intentParam = searchParams.get('intent') as ExportIntent | null
  const effectiveProjectId = projectId || 'new-project'

  const { selectedDimIds, setSelectedDimIds } = useExportStore()

  const [step, setStep] = useState<ExportStep>('intent')
  const [intent, setIntent] = useState<ExportIntent | null>(null)
  const [fileLabel, setFileLabel] = useState('')

  // Auto-advance based on intent param
  useEffect(() => {
    if (intentParam === 'resize') {
      setIntent('resize')
      setStep('select')
    } else if (intentParam === 'original') {
      setIntent('original')
      setStep('preview')
    }
  }, [intentParam])

  const handleIntentSelect = (i: ExportIntent) => {
    setIntent(i)
    if (i === 'original') {
      setStep('preview')
    } else {
      setStep('select')
    }
  }

  const handleSelectNext = () => {
    setStep('preview')
  }

  const handleExportDone = (label: string) => {
    setFileLabel(label)
    setStep('complete')
  }

  const handleExportAgain = () => {
    setSelectedDimIds([])
    setIntent(null)
    setStep('intent')
  }

  return (
    <div className="min-h-screen bg-frnd-dark">
      {step === 'intent' && <IntentGate onSelect={handleIntentSelect} onBack={() => navigate(`/kv-generator/projects/${effectiveProjectId}`)} />}
      {step === 'select' && intent === 'resize' && (
        <PlatformSizeStep
          selectedDims={new Set(selectedDimIds)}
          onSelectionChange={(next) => setSelectedDimIds(Array.from(next))}
          onNext={handleSelectNext}
          onBack={() => setStep('intent')}
        />
      )}
      {step === 'preview' && intent === 'resize' && (
        <ExportPreviewStep
          selectedDims={new Set(selectedDimIds)}
          effectiveProjectId={effectiveProjectId}
          onBack={() => setStep('select')}
          onExportDone={handleExportDone}
        />
      )}
      {step === 'preview' && intent === 'original' && (
        <DownloadOriginalStep
          effectiveProjectId={effectiveProjectId}
          onBack={() => setStep('intent')}
          onExportDone={handleExportDone}
        />
      )}
      {step === 'complete' && (
        <ExportCompleteStep
          fileLabel={fileLabel}
          effectiveProjectId={effectiveProjectId}
          onExportAgain={handleExportAgain}
        />
      )}
    </div>
  )
}
