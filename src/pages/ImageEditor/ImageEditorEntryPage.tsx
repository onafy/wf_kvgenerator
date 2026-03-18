import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Search, PenTool, Lock, AlertCircle, ChevronRight, X } from 'lucide-react'
import { useImageEditorStore } from '../../store/useImageEditorStore'
import { mockDAMAssets, mockBrandProfileV3 } from '../../mock'

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&h=600&fit=crop',
]

type Step = 'input' | 'brand'

export default function ImageEditorEntryPage() {
  const navigate = useNavigate()
  const { createProject } = useImageEditorStore()

  const [step, setStep] = useState<Step>('input')
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [damSearch, setDamSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'dam' | 'upload'>('dam')

  const filteredAssets = mockDAMAssets.filter((a) =>
    !damSearch || a.filename.toLowerCase().includes(damSearch.toLowerCase()) || a.campaignTag.toLowerCase().includes(damSearch.toLowerCase())
  )

  const handleContinueToCanvas = (withBrand: boolean) => {
    if (!selectedUrl) return
    const name = projectName || 'Untitled Project'
    createProject({
      name,
      sourceImageUrl: selectedUrl,
      brandEnabled: withBrand,
    })
    navigate('/image-editor/edit')
  }

  if (step === 'brand') {
    return (
      <div className="max-w-lg mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Apply Brand Identity?</h2>
          <p className="text-sm text-gray-500">Brand Identity injection constrains all AI prompts to CIMB's approved colors, typography, and locks brand assets from modification. This is optional.</p>
        </div>

        {/* Brand preview */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">CIMB Niaga — Brand Profile v3</p>
          <div className="flex items-center gap-4 mb-3">
            <img src={mockBrandProfileV3.logoUrl} alt="CIMB" className="h-7" />
            <div className="flex gap-2">
              {[mockBrandProfileV3.primaryColor, mockBrandProfileV3.secondaryColor].map((c) => (
                <div key={c.hex} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-gray-200" style={{ background: c.hex }} />
                  <span className="text-xs text-gray-600">{c.hex}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">Fonts: {mockBrandProfileV3.fonts.join(', ')}</p>
          <div className="mt-3 p-2 bg-amber-50 rounded-lg text-xs text-amber-700 flex items-start gap-1.5">
            <AlertCircle size={12} className="shrink-0 mt-0.5" />
            Once enabled, brand identity cannot be disabled mid-session. Start a new session to edit without constraints.
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleContinueToCanvas(false)} className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
            Skip — Edit without brand
          </button>
          <button onClick={() => handleContinueToCanvas(true)} className="flex-1 py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 flex items-center justify-center gap-2">
            <Lock size={14} /> Enable Brand Identity
          </button>
        </div>

        <button onClick={() => setStep('input')} className="w-full text-center text-xs text-gray-400 mt-4 hover:text-gray-600">
          ← Back to image selection
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <PenTool size={24} className="text-cimb-red" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Editor</h2>
        <p className="text-sm text-gray-500">Prompt-driven canvas editing. Draw masks, add text, erase regions — all executed in one AI job.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        {/* Project Name */}
        <div className="p-5 border-b border-gray-100 bg-gray-50">
           <label className="block text-sm font-semibold text-gray-900 mb-1">Project Name</label>
           <input
             value={projectName}
             onChange={(e) => setProjectName(e.target.value)}
             placeholder="e.g. Ramadan Hero Retouch"
             className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red bg-white"
           />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[{ key: 'dam', label: 'Select from DAM' }, { key: 'upload', label: 'Upload Local File' }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === t.key ? 'text-cimb-red border-b-2 border-cimb-red' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'dam' ? (
            <>
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={damSearch} onChange={(e) => setDamSearch(e.target.value)} placeholder="Search DAM assets..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red" />
              </div>
              {filteredAssets.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-500 mb-2">No DAM assets found for this client.</p>
                  <button onClick={() => setActiveTab('upload')} className="text-sm text-cimb-red hover:underline">Upload a local file instead</button>
                </div>
              ) : (
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
                      <div className="p-1.5 bg-white">
                        <p className="text-xs text-gray-600 truncate">{asset.filename}</p>
                        <p className="text-xs text-gray-400">{asset.dimensionLabel}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center hover:border-cimb-red/40 hover:bg-red-50/20 transition-colors cursor-pointer"
              onClick={() => {
                // Simulate upload: pick a demo image
                setSelectedUrl(DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)])
              }}>
              <Upload size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Click to upload or drag & drop</p>
              <p className="text-xs text-gray-400">JPG, PNG — max 50MB</p>
              {selectedUrl && activeTab === 'upload' && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-green-600">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  Image ready
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected preview */}
      {selectedUrl && (
        <div className="bg-white rounded-xl border border-cimb-red/20 p-4 mb-6 flex items-center gap-4">
          <img src={selectedUrl} alt="Selected" className="w-16 h-16 object-cover rounded-lg shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Image selected</p>
            <p className="text-xs text-gray-400">Ready to open in canvas editor</p>
          </div>
          <button onClick={() => setSelectedUrl(null)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
        </div>
      )}

      <button
        onClick={() => selectedUrl && setStep('brand')}
        disabled={!selectedUrl}
        className="w-full py-3.5 bg-cimb-red text-white font-semibold rounded-xl hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        Open in Editor <ChevronRight size={18} />
      </button>
    </div>
  )
}
