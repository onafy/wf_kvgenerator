import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Search, Maximize2, ChevronRight, X } from 'lucide-react'
import { useResizerStore } from '../../store/useResizerStore'
import { mockDAMAssets } from '../../mock'

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop',
]

export default function ResizerEntryPage() {
  const navigate = useNavigate()
  const { createProject } = useResizerStore()

  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [damSearch, setDamSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'dam' | 'upload'>('upload')

  const filteredAssets = mockDAMAssets.filter((a) =>
    !damSearch || a.filename.toLowerCase().includes(damSearch.toLowerCase()) || a.campaignTag.toLowerCase().includes(damSearch.toLowerCase())
  )

  const handleContinue = () => {
    if (!selectedUrl) return
    const id = createProject({
      name: projectName || 'Untitled Resize Job',
      sourceImageUrl: selectedUrl,
    })
    navigate(`/resizer/projects/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Maximize2 size={24} className="text-cimb-red" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">New Resizer Project</h2>
        <p className="text-sm text-gray-500">Upload a single asset to begin resizing for multi-platform delivery.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 bg-gray-50">
           <label className="block text-sm font-semibold text-gray-900 mb-1">Project Name</label>
           <input
             value={projectName}
             onChange={(e) => setProjectName(e.target.value)}
             placeholder="e.g. Ramadan Hero Repurpose"
             className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red bg-white"
           />
        </div>

        <div className="flex border-b border-gray-100">
          {[{ key: 'upload', label: 'Upload Local File' }, { key: 'dam', label: 'Select from DAM' }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === t.key ? 'text-cimb-red border-b-2 border-cimb-red' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-cimb-red/40 hover:bg-red-50/20 transition-colors cursor-pointer"
              onClick={() => { setSelectedUrl(DEMO_IMAGES[0]) }}>
              <Upload size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400">JPG, PNG — max 50MB</p>
            </div>
          ) : (
             <>
               <div className="relative mb-4">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input value={damSearch} onChange={(e) => setDamSearch(e.target.value)} placeholder="Search DAM assets..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red" />
               </div>
               <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                 {filteredAssets.map((asset) => (
                   <button key={asset.id} onClick={() => setSelectedUrl(asset.thumbnailUrl)}
                     className={`relative rounded-xl overflow-hidden border-2 transition-all ${selectedUrl === asset.thumbnailUrl ? 'border-cimb-red' : 'border-transparent hover:border-gray-200'}`}>
                     <img src={asset.thumbnailUrl} alt={asset.filename} className="w-full aspect-square object-cover" />
                     {selectedUrl === asset.thumbnailUrl && (
                       <div className="absolute inset-0 bg-cimb-red/10 flex items-center justify-center">
                         <div className="w-6 h-6 bg-cimb-red rounded-full flex items-center justify-center">
                           <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                         </div>
                       </div>
                     )}
                   </button>
                 ))}
               </div>
             </>
          )}
        </div>
      </div>

      {selectedUrl && (
        <div className="bg-white rounded-xl border border-cimb-red/20 p-4 mb-6 flex items-center gap-4">
          <img src={selectedUrl} alt="Selected" className="w-16 h-16 object-cover rounded-lg shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Image selected</p>
            <p className="text-xs text-gray-400">Ready to configure platform sizes</p>
          </div>
          <button onClick={() => setSelectedUrl(null)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!selectedUrl}
        className="w-full py-3.5 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-800 disabled:opacity-40 flex items-center justify-center gap-2 transition-colors"
      >
        Continue to Size Selection <ChevronRight size={18} />
      </button>
    </div>
  )
}
