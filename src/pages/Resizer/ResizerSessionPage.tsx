import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, Check, Loader2, PenTool, ChevronRight, Copy, Link2 } from 'lucide-react'
import { useResizerStore } from '../../store/useResizerStore'
import { useImageEditorStore } from '../../store/useImageEditorStore'
import { useExportStore } from '../../store/useExportStore'
import { mockDimensions } from '../../mock'
import type { DimensionProfile, DimensionPlatform, DimensionOrientation } from '../../types'

// ── Shared components from ExportPage logic... ───────────────────
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
function buildFilename(naming: any, dim: DimensionProfile) {
  const parts = [naming.campaign || 'Campaign', naming.segment || 'Segment', `${dim.width}x${dim.height}`, naming.version || 'v1']
  return parts.join('_').replace(/\s+/g, '') + '.png'
}

function ShareLinkPanel({ projectId, imageUrl }: { projectId: string; imageUrl: string }) {
  const { generateShareLink } = useExportStore()
  const [expiryDays, setExpiryDays] = useState(7)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = () => {
    const link = generateShareLink('resizer-export', projectId, expiryDays, imageUrl)
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
          className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-cimb-red"
        >
          {[7, 14, 30].map((d) => <option key={d} value={d}>Expires in {d} days</option>)}
        </select>
        <button onClick={handleGenerate} className="px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-700 whitespace-nowrap">
          Generate
        </button>
      </div>
      {generatedLink ? (
        <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
          <span className="flex-1 text-xs text-gray-600 truncate font-mono">{generatedLink}</span>
          <button onClick={handleCopy} className="shrink-0 text-gray-400 hover:text-gray-700">
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-400">No link generated yet — click Generate to create one.</p>
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

  const project = projects.find(p => p.id === id)

  // Wait for load
  useEffect(() => {
    loadProject(id || null)
  }, [id, loadProject])

  const [step, setStep] = useState<Step>('select')
  const [activePlatform, setActivePlatform] = useState<DimensionPlatform>('Meta')
  const [isExporting, setIsExporting] = useState(false)

  if (!project) return <div className="p-8 text-center text-gray-500">Project not found</div>

  const selectedDims = new Set(project.selectedDimIds)
  const toggleDim = (dimId: string) => {
    const s = new Set(selectedDims)
    s.has(dimId) ? s.delete(dimId) : s.add(dimId)
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
  const selectAll = () => saveProjectState({ selectedDimIds: mockDimensions.map(d => d.id) })
  const deselectAll = () => saveProjectState({ selectedDimIds: [] })

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

  const ORIENT_COLORS: Record<DimensionOrientation, string> = {
    Square: 'bg-blue-100 text-blue-700',
    Horizontal: 'bg-amber-100 text-amber-700',
    Vertical: 'bg-purple-100 text-purple-700',
  }

  if (step === 'select') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
             <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
             <p className="text-sm text-gray-500 mt-0.5">Select platforms & sizes</p>
          </div>
          <button onClick={() => navigate('/resizer')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
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
                   className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${activePlatform === p.id ? 'bg-cimb-red text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                 >
                   <span className="text-base">{p.icon}</span>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-medium truncate">{p.label}</p>
                     <p className={`text-xs ${activePlatform === p.id ? 'text-red-200' : 'text-gray-400'}`}>{selectedCount}/{dims.length}</p>
                   </div>
                 </button>
               )
             })}
             <div className="pt-2 border-t border-gray-100 space-y-1">
               <button onClick={selectAll} className="w-full text-xs text-gray-500 hover:text-gray-800 text-left px-2 py-1">Select all</button>
               <button onClick={deselectAll} className="w-full text-xs text-gray-500 hover:text-gray-800 text-left px-2 py-1">Deselect all</button>
             </div>
           </div>

           <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <span className="text-sm font-semibold text-gray-900">{PLATFORMS.find(p => p.id === activePlatform)?.label}</span>
                 <span className="text-xs text-gray-400">{activeDims.filter(d => selectedDims.has(d.id)).length} of {activeDims.length} selected</span>
               </div>
               <button
                 onClick={() => togglePlatformAll(activePlatform)}
                 className={`text-xs px-3 py-1 rounded-full border transition-colors ${activePlatformAllSelected ? 'bg-cimb-red text-white border-cimb-red' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
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
                     <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{orient}</p>
                     <div className="grid grid-cols-3 gap-2">
                       {dims.map((dim) => {
                         const sel = selectedDims.has(dim.id)
                         return (
                           <button
                             key={dim.id}
                             onClick={() => toggleDim(dim.id)}
                             className={`p-2.5 rounded-lg border-2 text-left transition-all ${sel ? 'border-cimb-red bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                           >
                             <p className="text-xs font-medium text-gray-800 leading-tight">{dim.label}</p>
                             <p className="text-xs text-gray-400 mt-0.5">{dim.width}×{dim.height}</p>
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
          <span className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{selectedDims.size}</span> size{selectedDims.size !== 1 ? 's' : ''} selected</span>
          <button
            onClick={() => setStep('preview')}
            disabled={selectedDims.size === 0}
            className="py-3 px-6 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-800 disabled:opacity-60 flex items-center gap-2"
          >
            <ChevronRight size={18} /> Continue to Export Preview
          </button>
        </div>
      </div>
    )
  }

  if (step === 'preview') {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Export Preview: {project.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Review {selectedDimList.length} selected size{selectedDimList.length !== 1 ? 's' : ''} before downloading</p>
          </div>
          <button onClick={() => setStep('select')} className="text-sm text-gray-500 hover:text-gray-700">← Back to Size Selection</button>
        </div>

        <div className="grid grid-cols-3 gap-6">
           <div className="col-span-2 space-y-6">
             <div className="bg-white rounded-xl border border-gray-200 p-5">
               <div className="grid grid-cols-3 gap-3">
                 {selectedDimList.map((dim) => {
                   const aspectRatio = dim.height / dim.width
                   const imageUrl = project.editedTileImages[dim.id] || project.sourceImageUrl
                   const isEdited = !!project.editedTileImages[dim.id]
                   return (
                     <div key={dim.id} className="rounded-xl border border-gray-100 overflow-hidden">
                       <div className="relative bg-gray-50 overflow-hidden" style={{ paddingBottom: `${Math.min(aspectRatio * 100, 120)}%` }}>
                         {imageUrl && <img src={imageUrl} alt={dim.label} className="absolute inset-0 w-full h-full object-cover" />}
                         {isEdited && (
                           <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                             <Check size={9} /> Edited
                           </div>
                         )}
                       </div>
                       <div className="p-2.5 bg-white space-y-2">
                         <div>
                           <p className="text-xs font-medium text-gray-700">{dim.label}</p>
                           <p className="text-xs text-gray-400">{dim.width}×{dim.height} · {dim.estimatedSize}</p>
                         </div>
                         <button
                           onClick={() => handleEditInImageEditor(dim.id, imageUrl!)}
                           className="w-full py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1"
                         >
                           <PenTool size={10} /> {isEdited ? 'Re-edit in Image Editor' : 'Edit in Image Editor'}
                         </button>
                       </div>
                     </div>
                   )
                 })}
               </div>
             </div>

             <div className="bg-white rounded-xl border border-gray-200 p-5">
               <h3 className="font-semibold text-gray-900 mb-4">Export Naming Convention</h3>
               <div className="grid grid-cols-3 gap-3 mb-4">
                 {[
                   { key: 'campaign' as const, label: 'Project Name', placeholder: 'e.g. RamadanPromo' },
                   { key: 'segment' as const, label: 'Segment', placeholder: 'e.g. Youth' },
                   { key: 'version' as const, label: 'Version', placeholder: 'v1' },
                 ].map((f) => (
                   <div key={f.key}>
                     <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                     <input 
                       value={project.naming[f.key]} 
                       onChange={(e) => saveProjectState({ naming: { ...project.naming, [f.key]: e.target.value } })} 
                       placeholder={f.placeholder} 
                       className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-cimb-red" 
                     />
                   </div>
                 ))}
               </div>
               <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 space-y-1">
                 {selectedDimList.slice(0, 3).map((d) => (
                   <div key={d.id} className="flex items-center gap-2">
                     <Check size={11} className="text-green-500 shrink-0" />
                     {buildFilename(project.naming, d)}
                   </div>
                 ))}
                 {selectedDimList.length > 3 && <div className="text-gray-400">...and {selectedDimList.length - 3} more</div>}
               </div>
               <div className="flex items-center gap-4 mt-4">
                 <span className="text-xs font-medium text-gray-600">ZIP Structure:</span>
                 {(['flat', 'grouped'] as const).map((m) => (
                   <button 
                     key={m} 
                     onClick={() => saveProjectState({ zipStructure: m })} 
                     className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${project.zipStructure === m ? 'bg-cimb-red text-white border-cimb-red' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                     {m === 'flat' ? 'Flat (all files)' : 'Grouped by category'}
                   </button>
                 ))}
               </div>
             </div>
           </div>

           <div>
             <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
               <h3 className="font-semibold text-gray-900 mb-1">Download Package</h3>
               <p className="text-xs text-gray-500 mb-4">{selectedDims.size} size{selectedDims.size !== 1 ? 's' : ''} · ZIP</p>
               <button onClick={handleDownload} disabled={isExporting} className="w-full py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 disabled:opacity-60 flex items-center justify-center gap-2">
                 {isExporting ? <><Loader2 size={16} className="animate-spin" /> Compiling ZIP...</> : <><Download size={16} /> Download ZIP</>}
               </button>
             </div>

             <div className="bg-white rounded-xl border border-gray-200 p-5 text-left mb-6">
               <div className="flex items-center gap-2 mb-1">
                 <Link2 size={14} className="text-cimb-red" />
                 <h3 className="font-semibold text-gray-900 text-sm">Share with client</h3>
                 <span className="ml-auto text-xs bg-cimb-red/10 text-cimb-red px-2 py-0.5 rounded-full font-medium">Recommended</span>
               </div>
               <p className="text-xs text-gray-500 mb-4">Generate a view-only link now so the client can review without needing a frndOS account.</p>
               <ShareLinkPanel projectId={project.id} imageUrl={project.sourceImageUrl || ''} />
             </div>
           </div>
        </div>
      </div>
    )
  }

  // step === 'complete'
  return (
    <div className="max-w-lg mx-auto px-6 py-12 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Export complete!</h2>
      <p className="text-sm text-gray-500 mb-8 font-mono">{selectedDimList.length} sizes (ZIP)</p>

      {/* Share link nudge — PRD 9.F */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-left mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link2 size={14} className="text-cimb-red" />
          <h3 className="font-semibold text-gray-900 text-sm">Share with client</h3>
          <span className="ml-auto text-xs bg-cimb-red/10 text-cimb-red px-2 py-0.5 rounded-full font-medium">Recommended</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">Generate a view-only link now so the client can review without needing a frndOS account.</p>
        <ShareLinkPanel projectId={project.id} imageUrl={project.sourceImageUrl || ''} />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/resizer')}
          className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
        >
          Back to Dashboard
        </button>
        <button
          onClick={() => setStep('preview')}
          className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
        >
          View Sizes
        </button>
      </div>
    </div>
  )
}
