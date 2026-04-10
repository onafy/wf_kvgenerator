import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Upload, Image, Search, CheckCircle2, X, AlertCircle,
  ArrowLeft, Sparkles, Layers,
  User, Users, UsersRound,
  Radio, PlusSquare, CheckCircle,
  Smartphone, Monitor, Square,
  CloudUpload,
} from 'lucide-react'
import { useContextStore } from '../../store/useContextStore'
import { useTemplateStore } from '../../store/useTemplateStore'
import { mockDAMAssets, mockBrandProfileV3 } from '../../mock'
import type { DAMAsset, MoodboardImage, FunnelStage, CanvasOrientation } from '../../types'

const SEGMENTS = [
  { value: 'Youth', icon: User, label: 'Youth' },
  { value: 'Family', icon: Users, label: 'Family' },
  { value: 'Mass', icon: UsersRound, label: 'Mass' },
]

const FUNNELS = [
  { value: 'Awareness', icon: Radio, label: 'Awareness' },
  { value: 'Consideration', icon: PlusSquare, label: 'Consideration' },
  { value: 'Conversion', icon: CheckCircle, label: 'Conversion' },
] as const

const ORIENTATIONS = [
  { value: 'Portrait', icon: Smartphone, label: 'Portrait', subtitle: 'Stories, Reels, Mobile' },
  { value: 'Landscape', icon: Monitor, label: 'Landscape', subtitle: 'Banners, YouTube, Desktop' },
  { value: 'Square', icon: Square, label: 'Square', subtitle: 'Feed, Instagram, Facebook' },
] as const

const ART_DIRECTION_CHIPS: Record<string, string[]> = {
  'Youth': ['energetic', 'dynamic', 'vibrant', 'street style', 'bold contrast'],
  'Family': ['warm tones', 'lifestyle', 'festive', 'natural light', 'heartfelt'],
  'Mass': ['clean', 'trustworthy', 'accessible', 'clear', 'professional'],
}

type AssetType = 'all' | 'photos' | 'illustrations' | 'videos'

/* ── DAM Browser Modal ────────────────────────────────────────────── */

function DAMBrowserModal({ isOpen, onClose, onSelectMultiple }: { isOpen: boolean; onClose: () => void; onSelectMultiple: (assets: DAMAsset[]) => void }) {
  const [q, setQ] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<AssetType>('all')
  const [campaignFilter, setCampaignFilter] = useState('All Campaigns')

  if (!isOpen) return null

  const filterByType = (assets: DAMAsset[]) => {
    if (activeTab === 'all') return assets
    return assets.filter(a => {
      if (activeTab === 'photos') return a.filename.match(/\.(jpg|jpeg|png)$/i)
      if (activeTab === 'illustrations') return a.filename.match(/\.(svg|ai|eps)$/i) || a.filename.toLowerCase().includes('illustration')
      if (activeTab === 'videos') return a.filename.match(/\.(mp4|mov|webm)$/i) || a.filename.toLowerCase().includes('video')
      return true
    })
  }

  const filterByCampaign = (assets: DAMAsset[]) => {
    if (campaignFilter === 'All Campaigns') return assets
    return assets.filter(a => a.campaignTag === campaignFilter)
  }

  const filtered = filterByCampaign(filterByType(
    mockDAMAssets.filter((a) =>
      a.filename.toLowerCase().includes(q.toLowerCase()) ||
      a.campaignTag.toLowerCase().includes(q.toLowerCase())
    )
  ))

  const availableCampaignTags = [...new Set(mockDAMAssets.map(a => a.campaignTag))]

  const handleToggle = (asset: DAMAsset) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(asset.id)) {
      newSet.delete(asset.id)
    } else {
      newSet.add(asset.id)
    }
    setSelectedIds(newSet)
  }

  const handleConfirm = () => {
    const selectedAssets = mockDAMAssets.filter(a => selectedIds.has(a.id))
    onSelectMultiple(selectedAssets)
    setSelectedIds(new Set())
    onClose()
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'photos', label: 'Photos' },
    { key: 'illustrations', label: 'Illustrations' },
    { key: 'videos', label: 'Videos' },
  ] as const

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-frnd-dark rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/10">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Browse DAM Assets</h2>
            <p className="text-xs text-gray-500">Select unlimited assets for your campaign</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="px-6 py-3 border-b border-white/10 bg-white/5">
          <div className="flex flex-col gap-3">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-white text-frnd-dark'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by filename..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
                />
              </div>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-white/10 rounded-lg bg-white/5 text-gray-300 focus:outline-none focus:border-white/30"
              >
                <option value="All Campaigns" className="bg-frnd-dark">All Campaigns</option>
                {availableCampaignTags.map((tag) => (
                  <option key={tag} value={tag} className="bg-frnd-dark">{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-black/20 min-h-[300px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400 font-medium">No assets found</p>
              <p className="text-gray-600 text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filtered.map((asset) => {
                const isSelected = selectedIds.has(asset.id)
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleToggle(asset)}
                    className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-white'
                        : 'hover:ring-1 hover:ring-white/30'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img src={asset.thumbnailUrl} alt={asset.filename} className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-0.5 shadow-lg">
                          <CheckCircle2 size={16} className="text-frnd-dark" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white/5">
                      <p className="text-xs font-medium text-gray-300 truncate">{asset.filename}</p>
                      <p className="text-[10px] text-gray-600">{asset.dimensionLabel}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center bg-white/5">
          <span className="text-sm font-medium text-gray-400">{selectedIds.size} asset{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
            <button
              disabled={selectedIds.size === 0}
              onClick={handleConfirm}
              className="px-6 py-2.5 text-sm font-medium text-frnd-dark bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
            >
              {selectedIds.size === 0 ? 'Select at least 1 asset' : `Add ${selectedIds.size} Asset${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ───────────────────────────────────────────────── */

export default function AssetConfigPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { draft, updateDraft, lockContext } = useContextStore()
  const { getTemplate } = useTemplateStore()
  const [errors, setErrors] = useState<string[]>([])
  const [showCampaignHints, setShowCampaignHints] = useState(false)
  const [showKeywordsSuggestions, setShowKeywordsSuggestions] = useState(false)
  const [isDamModalOpen, setIsDamModalOpen] = useState(false)
  const moodboardInputRef = useRef<HTMLInputElement>(null)

  // Detect template from URL param and store in context
  const templateIdFromUrl = searchParams.get('template')
  const attachedTemplate = templateIdFromUrl ? getTemplate(templateIdFromUrl) : null

  useEffect(() => {
    if (templateIdFromUrl) {
      updateDraft({ selectedTemplateId: templateIdFromUrl })
    }
  }, [templateIdFromUrl])

  const totalAssets = draft.assets.length

  const handleAddAssets = (assetsToAdd: DAMAsset[]) => {
    updateDraft({ assets: [...draft.assets, ...assetsToAdd] })
  }

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

  const handleMoodboardAdd = (files: Iterable<File>) => {
    const current = draft.moodboard
    if (current.length >= 6) return
    const remaining = 6 - current.length
    const newImages: MoodboardImage[] = Array.from(files).slice(0, remaining).map((file) => ({
      id: `mb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    }))
    updateDraft({ moodboard: [...current, ...newImages] })
  }

  const handleMoodboardRemove = (id: string) => {
    const img = draft.moodboard.find((m) => m.id === id)
    if (img) URL.revokeObjectURL(img.previewUrl)
    updateDraft({ moodboard: draft.moodboard.filter((m) => m.id !== id) })
  }

  const handleGenerate = () => {
    const errs: string[] = []
    if (draft.assets.length === 0) errs.push('Please select at least one asset.')
    if (!draft.copy.trim()) errs.push('Campaign Context is required.')
    if (!draft.segment) errs.push('Target segment is required.')
    if (!draft.funnel) errs.push('Funnel stage is required.')
    if (errs.length) { setErrors(errs); return }
    setErrors([])
    lockContext()
    navigate('/kv-generator/new/generate')
  }

  const brandColors = [
    mockBrandProfileV3.primaryColor,
    mockBrandProfileV3.secondaryColor,
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 mt-10 mb-9">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">New KV Project</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your campaign context and assets</p>
      </div>

      {/* Template Attached Banner */}
      {attachedTemplate && (
        <div className="mb-6 flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.04]">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img src={attachedTemplate.thumbnailUrl} alt={attachedTemplate.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Layers size={13} className="text-white/40" />
              <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Template Attached</span>
            </div>
            <p className="text-sm font-semibold text-white line-clamp-1">{attachedTemplate.name}</p>
            <p className="text-xs text-white/40 mt-0.5">
              {attachedTemplate.boundingBoxes.length} zone{attachedTemplate.boundingBoxes.length !== 1 ? 's' : ''} · by {attachedTemplate.creatorName}
              <span className="ml-2 text-white/25">Will be applied in the editor after generation</span>
            </p>
          </div>
          <button
            onClick={() => {
              updateDraft({ selectedTemplateId: null })
              navigate('/kv-generator/new')
            }}
            className="shrink-0 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          {errors.map((e) => (
            <div key={e} className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle size={14} />{e}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-8">
        {/* ═══════════════════ SECTION: Brand ═══════════════════ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <img
            src={mockBrandProfileV3.logoUrl}
            alt={mockBrandProfileV3.clientName}
            className="w-12 h-12 rounded-lg object-cover bg-white/10"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{mockBrandProfileV3.clientName}</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              {brandColors.map((c) => (
                <div
                  key={c.hex}
                  className="w-4 h-4 rounded-full border border-white/10"
                  style={{ background: c.hex }}
                  title={`${c.name} — ${c.hex}`}
                />
              ))}
              <div className="w-4 h-4 rounded-full bg-frnd-dark border border-white/10" title="Dark" />
              <div className="w-4 h-4 rounded-full bg-white/80 border border-white/10" title="Light" />
            </div>
          </div>
          <p className="text-xs text-gray-500 text-right leading-relaxed">
            Brand identity auto-injected<br />into every generated KV
          </p>
        </div>

        {/* ═══════════════════ SECTION: Assets ═══════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white">Selected Assets</h3>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white hover:bg-white/15 transition-colors cursor-pointer">
                <Upload size={15} /> Upload
                <input type="file" multiple accept="image/png, image/jpeg" className="hidden" onChange={(e) => {
                  if (e.target.files?.length) {
                    const pseudoAssets = Array.from(e.target.files).map((f, i) => ({
                      ...mockDAMAssets[i % mockDAMAssets.length],
                      id: `uploaded-${Date.now()}-${i}`,
                      filename: f.name,
                    }))
                    handleAddAssets(pseudoAssets)
                  }
                  e.target.value = ''
                }} />
              </label>
              <button
                onClick={() => setIsDamModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white hover:bg-white/15 transition-colors"
              >
                <Image size={15} /> Browse DAM
              </button>
            </div>
          </div>

          {/* Asset Thumbnails */}
          {totalAssets > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3">
              {draft.assets.map((asset, idx) => (
                <div key={`asset-${asset.id}-${idx}`} className="shrink-0 w-28 rounded-xl border border-white/10 bg-white/5 overflow-hidden relative group hover:border-white/20 transition-colors">
                  <div className="aspect-square relative">
                    <img src={asset.thumbnailUrl} alt={asset.filename} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => handleRemoveAsset(idx)} className="bg-white/90 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold">Remove</button>
                    </div>
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[10px] text-gray-400 truncate">{asset.filename}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Drop Zone */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl bg-transparent py-10 cursor-pointer transition-all">
            <CloudUpload size={36} className="text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Drop images here</p>
            <p className="text-xs text-gray-600 mt-1">or click to browse — then pick from DAM</p>
            <input type="file" multiple accept="image/png, image/jpeg" className="hidden" onChange={(e) => {
              if (e.target.files?.length) {
                const pseudoAssets = Array.from(e.target.files).map((f, i) => ({
                  ...mockDAMAssets[i % mockDAMAssets.length],
                  id: `uploaded-${Date.now()}-${i}`,
                  filename: f.name,
                }))
                handleAddAssets(pseudoAssets)
              }
              e.target.value = ''
            }} />
          </label>

          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-3">
            <span className="text-gray-500">+</span> Unlimited assets — mix local uploads and DAM assets freely
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* ═══════════════════ SECTION: Context ═══════════════════ */}

        {/* Project Metadata */}
         
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Project Name</p>
              <input
                value={draft.projectName}
                onChange={(e) => updateDraft({ projectName: e.target.value })}
                placeholder="e.g. RamadanPromo"
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Segment</p>
              <div className={`px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg ${draft.segment ? 'text-white' : 'text-gray-600'}`}>
                {draft.segment || 'e.g. Youth'}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Version</p>
              <div className="px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white">
                v1
              </div>
            </div>
          </div>

          {/* Live name preview */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-xs text-gray-600">Preview:</span>
            <span className="text-xs font-mono text-gray-400">
              <span className={draft.projectName ? 'text-white' : 'text-gray-600'}>
                {(draft.projectName || 'projectname').toLowerCase().replace(/\s+/g, '')}
              </span>
              <span className="text-gray-600">_</span>
              <span className={draft.segment ? 'text-white' : 'text-gray-600'}>
                {(draft.segment || 'segment').toLowerCase()}
              </span>
              <span className="text-gray-600">_</span>
              <span className="text-white">v1</span>
            </span>
          </div>
        </div>

        {/* Campaign Context */}
        <div className="mt-10 mb-8">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold text-white">
              Campaign Context <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCampaignHints(!showCampaignHints)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showCampaignHints ? 'hide hints' : 'show hints'}
            </button>
          </div>
          <textarea
            value={draft.copy}
            onChange={(e) => updateDraft({ copy: e.target.value })}
            rows={7}
            placeholder={`# Campaign Name
[What is this campaign called? e.g. Ramadan Sale 2026, Product Launch Axi]

# Key Message
[The one thing you want people to remember after seeing this KV]

# USP / Differentiation
[What makes this brand/product stand out from competitors?]

# Copywriting
[The main text that will appear on the KV — headlines, taglines, any copy elements]

# Target Audience
[Age, gender, location, lifestyle, interests — any detail that helps the AI picture your audience]
[Or skip — the segment you selected above already provides a baseline]

# Additional Context
[Any other info that could help the AI: competitor references, past executions to avoid, mandatory elements, etc.]`}
            className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/30 transition-colors placeholder:text-[13px] placeholder:font-normal placeholder:text-gray-500"
          />

          {showCampaignHints && (
            <div className="mt-3 p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-gray-400 mb-3">Tips for better KV results:</p>
              <div className="space-y-2">
                {[
                  ['Campaign Name', 'Sets the background context — without this, the AI works in a vacuum.'],
                  ['Key Message', 'The one thing viewers must remember. If they only remember one thing, what is it?'],
                  ['USP / Differentiation', 'Why choose this over a competitor? The AI uses this to make the KV more compelling.'],
                  ['Copywriting', 'Main headlines, taglines, or copy direction — used as visual context for the AI, not rendered directly on the KV.'],
                  ['Target Audience', 'Details beyond the segment label — age, gender, lifestyle, interests. Leave blank if segment is enough.'],
                  ['Additional Context', 'Competitor references, past executions to avoid, mandatory elements, or other context.'],
                ].map(([title, desc]) => (
                  <div key={title} className="flex items-start gap-2.5">
                    <span className="text-gray-500 text-xs shrink-0 mt-0.5">•</span>
                    <div>
                      <span className="text-xs font-medium text-gray-300">{title}</span>
                      <span className="text-xs text-gray-500"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-600 mt-3">You don't have to fill every section. The more you share, the better the AI understands your campaign.</p>
            </div>
          )}

          {!showCampaignHints && (
            <p className="text-xs text-gray-600 mt-1">The more context you provide, the better the AI understands your campaign. Each section is optional — fill what's relevant.</p>
          )}
        </div>

        {/* Segment + Funnel in one row */}
        <div className="flex gap-0 mt-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-white mb-30">
              Target Audience <span className="text-red-400 mr-2">*</span>
              <span className="text-gray-500 font-normal">Who sees this?</span>
            </label>
            <div className="flex gap-2">
              {SEGMENTS.map((s) => {
                const Icon = s.icon
                const isActive = draft.segment === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => updateDraft({ segment: s.value })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-frnd-dark'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Vertical divider */}
          <div className="w-px bg-white/10 mx-6 self-stretch" />

          <div className="flex-1">
            <label className="block text-sm font-semibold text-white mb-3">
              Funnel <span className="text-red-400 mr-2">*</span>
              <span className="text-gray-500 font-normal">Customer journey stage</span>
            </label>
            <div className="flex gap-2">
              {FUNNELS.map((f) => {
                const Icon = f.icon
                const isActive = draft.funnel === f.value
                return (
                  <button
                    key={f.value}
                    onClick={() => updateDraft({ funnel: f.value as FunnelStage })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white text-frnd-dark'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={15} strokeWidth={1.5} />
                    {f.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Canvas Orientation */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3">
            Canvas Orientation <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ORIENTATIONS.map((o) => {
              const Icon = o.icon
              const isActive = draft.canvasOrientation === o.value
              return (
                <button
                  key={o.value}
                  onClick={() => updateDraft({ canvasOrientation: o.value as CanvasOrientation })}
                  className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-white/10 border-white/40 text-white'
                      : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Icon size={24} strokeWidth={1.5} />
                  <span className="text-sm font-medium">{o.label}</span>
                  <span className="text-[11px] text-gray-500">{o.subtitle}</span>
                </button>
              )
            })}
          </div>
        </div>
{/* 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20' */}

        {/* ═══════════════════ SECTION: Creative Direction ═══════════════════ */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-6">
          <h3 className="text-base font-semibold text-white">
            Creative Direction <span className="text-gray-500 font-normal text-sm">(optional)</span>
          </h3>

          {/* Keywords Direction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">Keywords Direction</label>
              <button
                type="button"
                onClick={() => {
                  if (artDirectionChips.length > 0) {
                    updateDraft({ artDirection: artDirectionChips.join(', ') })
                    setShowKeywordsSuggestions(true)
                  }
                }}
                className="text-xs text-gray-400 font-medium hover:text-white flex items-center gap-1 transition-colors"
              >
                <Sparkles size={12} /> Suggest by AI
              </button>
            </div>
            <input
              value={draft.artDirection}
              onChange={(e) => updateDraft({ artDirection: e.target.value.slice(0, 100) })}
              placeholder="e.g. cinematic, moody, warm tones"
              className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
            />
            {showKeywordsSuggestions && artDirectionChips.length > 0 && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={11} className="text-gray-500" />
                  <span className="text-[11px] text-gray-500">Toggle individual keywords:</span>
                  <button
                    type="button"
                    onClick={() => setShowKeywordsSuggestions(false)}
                    className="text-[10px] text-gray-600 hover:text-gray-400 ml-auto underline"
                  >
                    dismiss
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {artDirectionChips.map((chip) => {
                    const active = draft.artDirection.split(',').map(k => k.trim()).includes(chip)
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          const current = draft.artDirection.split(',').map(k => k.trim()).filter(Boolean)
                          const updated = active
                            ? current.filter(k => k !== chip)
                            : [...current, chip]
                          updateDraft({ artDirection: updated.join(', ') })
                        }}
                        className={`px-2.5 py-0.5 text-xs rounded-full border transition-colors ${
                          active
                            ? 'bg-white/20 text-white border-white/30'
                            : 'bg-white/5 text-gray-500 border-white/10 hover:text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {active ? '✓ ' : '+ '}{chip}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-1.5">Separate keywords with commas</p>
          </div>

          <div className="border-t border-white/5" />

          {/* Moodboard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Moodboard</label>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-medium text-white hover:bg-white/15 transition-colors cursor-pointer">
                <Upload size={13} /> Upload
                <input
                  ref={moodboardInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files) handleMoodboardAdd(e.target.files); e.target.value = '' }}
                />
              </label>
            </div>

            {/* Thumbnails row */}
            {draft.moodboard.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {draft.moodboard.map((img, idx) => (
                  <div key={img.id} className="shrink-0 w-24 rounded-xl border border-white/10 bg-white/5 overflow-hidden relative group hover:border-white/20 transition-colors">
                    <div className="aspect-square relative">
                      <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleMoodboardRemove(img.id)} className="bg-white/90 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold">Remove</button>
                      </div>
                      {draft.moodboard.length > 1 && (
                        <div className="absolute top-1.5 left-1.5 bg-black/70 text-white rounded-md px-1.5 py-0.5 text-[9px] font-semibold leading-none">
                          #{idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] text-gray-400 truncate">{img.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            {draft.moodboard.length < 6 && (
              <label
                className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-white/20 rounded-2xl bg-transparent py-8 cursor-pointer transition-all"
                onPaste={(e) => {
                  const items = Array.from(e.clipboardData.items).filter(i => i.type.startsWith('image/'))
                  if (items.length === 0) return
                  const files = items.map(i => i.getAsFile()).filter(Boolean) as File[]
                  if (files.length) handleMoodboardAdd(files)
                }}
              >
                <CloudUpload size={28} className="text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 font-medium">Drop images here</p>
                <p className="text-xs text-gray-600 mt-1">or click to upload · paste with Cmd+V</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) handleMoodboardAdd(e.target.files); e.target.value = '' }} />
              </label>
            )}
            <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-2">
              <span className="text-gray-500">+</span> Max 6 images — mix uploads and pastes freely
            </p>
          </div>

          <div className="border-t border-white/5" />

          {/* Explain Your Direction */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Explain Your Direction</label>
            <textarea
              value={draft.directionExplanation}
              onChange={(e) => updateDraft({ directionExplanation: e.target.value })}
              placeholder="Describe the look and feel you're going for. E.g., 'I want a warm, aspirational tone with soft gradients — similar to #1 but with the color palette from #2...'"
              rows={3}
              className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 resize-none focus:outline-none focus:border-white/30 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1">Reference moodboard images by number, e.g. "mood like #1 but palette from #2"</p>
          </div>
        </div>

        {/* Divider + Navigation */}
        <div className="border-t border-white/10 pt-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/kv-generator')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-white text-frnd-dark hover:bg-gray-200 transition-colors"
          >
            <Sparkles size={16} /> Generate KV
          </button>
        </div>
      </div>

      <DAMBrowserModal
        isOpen={isDamModalOpen}
        onClose={() => setIsDamModalOpen(false)}
        onSelectMultiple={handleAddAssets}
      />
    </div>
  )
}
