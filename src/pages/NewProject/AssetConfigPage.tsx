import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Search, Lock, CheckCircle2, X, AlertCircle, Wand2 } from 'lucide-react'
import { useContextStore } from '../../store/useContextStore'
import { mockDAMAssets, mockBrandProfileV3 } from '../../mock'
import type { DAMAsset } from '../../types'

const SEGMENTS = ['Youth', 'Family', 'Mass']
const FUNNELS = ['Awareness', 'Consideration', 'Conversion'] as const
const ORIENTATIONS = ['Portrait', 'Landscape', 'Square'] as const

const ART_DIRECTION_CHIPS: Record<string, string[]> = {
  'Youth': ['energetic', 'dynamic', 'vibrant', 'street style', 'bold contrast'],
  'Family': ['warm tones', 'lifestyle', 'festive', 'natural light', 'heartfelt'],
  'Mass': ['clean', 'trustworthy', 'accessible', 'clear', 'professional'],
}

type AssetType = 'all' | 'photos' | 'illustrations' | 'videos'

function DAMBrowserModal({ isOpen, onClose, onSelectMultiple }: { isOpen: boolean; onClose: () => void; onSelectMultiple: (assets: DAMAsset[]) => void }) {
  const [q, setQ] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<AssetType>('all')
  const [campaignFilter, setCampaignFilter] = useState('All Campaigns')

  if (!isOpen) return null;

  // Filter by type (simulated - in real app, DAM would have type field)
  const filterByType = (assets: DAMAsset[]) => {
    if (activeTab === 'all') return assets
    // Mock filtering based on filename patterns
    return assets.filter(a => {
      if (activeTab === 'photos') return a.filename.match(/\.(jpg|jpeg|png)$/i)
      if (activeTab === 'illustrations') return a.filename.match(/\.(svg|ai|eps)$/i) || a.filename.toLowerCase().includes('illustration')
      if (activeTab === 'videos') return a.filename.match(/\.(mp4|mov|webm)$/i) || a.filename.toLowerCase().includes('video')
      return true
    })
  }

  // Filter by campaign
  const filterByCampaign = (assets: DAMAsset[]) => {
    if (campaignFilter === 'All Campaigns') return assets
    return assets.filter(a => a.campaignTag === campaignFilter)
  }

  // Combined filter
  const filtered = filterByCampaign(filterByType(
    mockDAMAssets.filter((a) =>
      a.filename.toLowerCase().includes(q.toLowerCase()) ||
      a.campaignTag.toLowerCase().includes(q.toLowerCase())
    )
  ))

  // Get unique campaign tags from mock data
  const availableCampaignTags = [...new Set(mockDAMAssets.map(a => a.campaignTag))]

  const handleToggle = (asset: DAMAsset) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(asset.id)) {
      newSet.delete(asset.id)
    } else {
      newSet.add(asset.id)  // No limit - unlimited selection
    }
    setSelectedIds(newSet)
  }

  const handleConfirm = () => {
    const selectedAssets = mockDAMAssets.filter(a => selectedIds.has(a.id));
    onSelectMultiple(selectedAssets);
    setSelectedIds(new Set());
    onClose();
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'photos', label: 'Photos' },
    { key: 'illustrations', label: 'Illustrations' },
    { key: 'videos', label: 'Videos' },
  ] as const

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
           <div>
             <h2 className="text-lg font-bold text-gray-900">Browse DAM Assets</h2>
             <p className="text-xs text-gray-500">Select unlimited assets for your campaign</p>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white">
          <div className="flex flex-col gap-3">
            {/* Type Tabs */}
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-cimb-red text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search and Campaign Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by filename..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red"
                />
              </div>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red bg-white"
              >
                {availableCampaignTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 min-h-[300px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No assets found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((asset) => {
                 const isSelected = selectedIds.has(asset.id);
                 return (
                   <div
                    key={asset.id}
                    onClick={() => handleToggle(asset)}
                    className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${isSelected ? 'border-cimb-red ring-4 ring-cimb-red/10' : 'border-gray-200 hover:border-gray-300'}`}
                   >
                      <div className="aspect-square relative">
                        <img src={asset.thumbnailUrl} alt={asset.filename} className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-cimb-red rounded-full p-0.5 shadow-lg">
                            <CheckCircle2 size={16} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white">
                         <p className="text-xs font-medium text-gray-700 truncate">{asset.filename}</p>
                         <p className="text-[10px] text-gray-400">{asset.dimensionLabel}</p>
                      </div>
                   </div>
                 )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
           <span className="text-sm font-medium text-gray-600">{selectedIds.size} asset{selectedIds.size !== 1 ? 's' : ''} selected</span>
           <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
              <button
                disabled={selectedIds.size === 0}
                onClick={handleConfirm}
                className="px-6 py-2.5 text-sm font-medium text-white bg-cimb-red hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
              >
                {selectedIds.size === 0 ? 'Select at least 1 asset to continue' : `Add ${selectedIds.size} Asset${selectedIds.size !== 1 ? 's' : ''}`}
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}

export default function AssetConfigPage() {
  const navigate = useNavigate()
  const { draft, updateDraft, lockContext } = useContextStore()
  const [errors, setErrors] = useState<string[]>([])
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [isDamModalOpen, setIsDamModalOpen] = useState(false)

  // Auto-generate project name preview
  const autoProjectName = draft.copy.trim().split(/\s+/).slice(0, 4).join(' ')

  // All selected assets - single array, no base/custom distinction
  const totalAssets = draft.assets.length

  const handleAddAssets = (assetsToAdd: DAMAsset[]) => {
    updateDraft({
      assets: [...draft.assets, ...assetsToAdd]
    })
  };

  const handleRemoveAsset = (index: number) => {
    const newAssets = [...draft.assets]
    newAssets.splice(index, 1)
    updateDraft({ assets: newAssets })
  }

  const artDirectionChips = useMemo(() => {
    if (draft.segment) {
      return ART_DIRECTION_CHIPS[draft.segment] || []
    }
    return []
  }, [draft.segment])

  const appendChip = (chip: string) => {
    const current = draft.artDirection.trim()
    const newVal = current ? `${current}, ${chip}` : chip
    if (newVal.length <= 100) updateDraft({ artDirection: newVal })
  }

  const handleLock = () => {
    const errs: string[] = []
    if (draft.assets.length === 0) errs.push('Please select at least one asset from DAM or upload a local file.')
    if (!draft.copy.trim()) errs.push('Campaign Brief / Copy is required.')
    if (!draft.segment) errs.push('Target segment is required.')
    if (!draft.funnel) errs.push('Funnel stage is required.')
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    // Directly lock context and proceed to generation
    lockContext()
    navigate('/kv-generator/new/generate')
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {errors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          {errors.map((e) => <div key={e} className="flex items-center gap-2 text-sm text-red-600"><AlertCircle size={14} />{e}</div>)}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Assets + Context */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
               <div>
                  <h3 className="font-bold text-gray-900 text-base">Campaign Assets</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Your Base Asset defines the layout context; Custom Assets are mapped dynamically.</p>
               </div>
               <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">{totalAssets} Selected</span>
            </div>

            {/* Assets Display - Flexible Grid */}
            {totalAssets > 0 && (
              <div className="mb-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {/* All Assets - no base/custom distinction */}
                  {draft.assets.map((asset, idx) => (
                    <div key={`asset-${asset.id}-${idx}`} className="shrink-0 w-32 rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden relative group hover:border-gray-300 transition-colors">
                       <div className="px-2 py-1.5 bg-gray-200 text-gray-600">
                          <span className="text-[10px] uppercase tracking-wider font-bold">Asset {idx + 1}</span>
                       </div>
                       <div className="aspect-[3/4] relative">
                          <img src={asset.thumbnailUrl} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                             <button onClick={() => handleRemoveAsset(idx)} className="bg-white/90 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold">Remove</button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Assets */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-xl bg-gray-50/50 p-5 transition-all">
               <p className="text-sm text-gray-600 mb-3 text-center">
                  {totalAssets === 0
                    ? 'Add your first asset to get started'
                    : `Add more assets (${totalAssets} currently selected)`}
               </p>
               <div className="flex gap-3">
                  <button onClick={() => setIsDamModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-cimb-red hover:text-cimb-red shadow-sm transition-all hover:shadow">
                     <Search size={16} /> Browse DAM
                  </button>

                  <label className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white border border-transparent rounded-xl text-sm font-medium hover:bg-black shadow-sm transition-all hover:shadow cursor-pointer">
                     <Upload size={16} /> Upload Files
                     <input type="file" multiple accept="image/png, image/jpeg" className="hidden" onChange={(e) => {
                        if (e.target.files?.length) {
                           const pseudoAssets = Array.from(e.target.files).map((f, i) => ({
                             ...mockDAMAssets[i % mockDAMAssets.length],
                             id: `uploaded-${Date.now()}-${i}`,
                             filename: f.name
                           }));
                           handleAddAssets(pseudoAssets);
                        }
                        e.target.value = '';
                     }} />
                  </label>
               </div>
               <div className="flex items-center gap-1 mt-3">
                  <Lock size={10} className="text-green-600" />
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Unlimited assets supported</p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Campaign Context</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Project Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={draft.projectName}
                  onChange={(e) => updateDraft({ projectName: e.target.value })}
                  placeholder={autoProjectName || 'Auto-generated from Campaign Brief'}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red"
                />
                {!draft.projectName && autoProjectName && (
                  <p className="text-xs text-gray-400 mt-1">Will use: "{autoProjectName}"</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Campaign Brief / Copy <span className="text-red-500">*</span></label>
                <textarea
                  value={draft.copy}
                  onChange={(e) => updateDraft({ copy: e.target.value })}
                  rows={3}
                  placeholder="e.g. Ramadan campaign for CIMB Niaga, warm and festive mood, targeting young families"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red"
                />
                <p className="text-xs text-gray-400 mt-0.5">Used as AI generation context only — not rendered in the image.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target Segment <span className="text-red-500">*</span></label>
                  <select value={draft.segment} onChange={(e) => updateDraft({ segment: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red bg-white">
                    <option value="">Select segment...</option>
                    {SEGMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Funnel Stage <span className="text-red-500">*</span></label>
                  <select value={draft.funnel} onChange={(e) => updateDraft({ funnel: e.target.value as any })} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red bg-white">
                    <option value="">Select funnel...</option>
                    {FUNNELS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Canvas Orientation <span className="text-red-500">*</span></label>
                <div className="flex gap-4">
                  {ORIENTATIONS.map((o) => (
                    <label key={o} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="canvasOrientation" 
                        value={o} 
                        checked={draft.canvasOrientation === o} 
                        onChange={(e) => updateDraft({ canvasOrientation: e.target.value as any })}
                        className="text-cimb-red focus:ring-cimb-red"
                      />
                      <span className="text-sm text-gray-700">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    <Wand2 size={11} className="text-gray-400" /> Art Direction <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  {!showAiSuggestions && (
                    <button 
                      type="button"
                      onClick={() => setShowAiSuggestions(true)}
                      className="text-xs text-cimb-red font-medium hover:text-red-800 flex items-center gap-1"
                    >
                      <Wand2 size={10} /> Suggest by AI
                    </button>
                  )}
                </div>
                <input
                  value={draft.artDirection}
                  onChange={(e) => updateDraft({ artDirection: e.target.value.slice(0, 100) })}
                  placeholder="e.g. cinematic, moody, warm tones"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red"
                />
                <div className="flex items-start justify-between mt-1.5">
                  <div className="flex-1">
                    {showAiSuggestions && artDirectionChips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {artDirectionChips.map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => appendChip(chip)}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-cimb-red/10 hover:text-cimb-red border border-transparent hover:border-cimb-red/20 transition-colors"
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 ml-4 pt-1">{draft.artDirection.length}/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Brand Identity sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} className="text-green-500" />
              <h3 className="text-sm font-semibold text-gray-900">Brand Identity</h3>
            </div>
            <div className="text-xs text-gray-500 mb-4">Auto-injected for CIMB Niaga (v3)</div>
            <img src={mockBrandProfileV3.logoUrl} alt="CIMB Logo" className="h-6 mb-4" />
            <div className="space-y-2 mb-4">
              {[mockBrandProfileV3.primaryColor, mockBrandProfileV3.secondaryColor].map((c) => (
                <div key={c.hex} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded border border-gray-200 shrink-0" style={{ background: c.hex }} />
                  <div><p className="text-xs font-medium text-gray-700">{c.name}</p><p className="text-xs text-gray-400">{c.hex}</p></div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Approved Fonts</p>
              {mockBrandProfileV3.fonts.map((f) => <div key={f} className="text-xs text-gray-700 font-medium">{f}</div>)}
            </div>
          </div>

          <button onClick={handleLock} className="w-full py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 transition-colors flex items-center justify-center gap-2">
            <Lock size={16} /> Lock Context & Continue
          </button>
        </div>
      </div>

      {/* DAM Browser Modal */}
      <DAMBrowserModal
        isOpen={isDamModalOpen}
        onClose={() => setIsDamModalOpen(false)}
        onSelectMultiple={handleAddAssets}
      />
    </div>
  )
}
