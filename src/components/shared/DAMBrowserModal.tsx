import { useState, useMemo } from 'react'
import { Search, X, Check } from 'lucide-react'
import { mockDAMAssets } from '../../mock'

interface DAMBrowserModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (assets: { id: string; name: string; url: string; thumbnailUrl: string }[]) => void
}

// campaignTag list derived from mockDAMAssets
const CAMPAIGN_TAGS = [...new Set(mockDAMAssets.map((a) => a.campaignTag))].filter(Boolean)

const ASSET_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'photo', label: 'Photos' },
  { value: 'illustration', label: 'Illustrations' },
]

export function DAMBrowserModal({ isOpen, onClose, onAdd }: DAMBrowserModalProps) {
  const [activeType, setActiveType] = useState<'all' | 'photo' | 'illustration'>('all')
  const [campaignFilter, setCampaignFilter] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return mockDAMAssets.filter((a) => {
      const matchesType = activeType === 'all' || a.campaignTag === activeType
      const matchesCampaign = !campaignFilter || a.campaignTag === campaignFilter
      const matchesSearch = !search || a.filename.toLowerCase().includes(search.toLowerCase())
      return matchesType && matchesCampaign && matchesSearch
    })
  }, [activeType, campaignFilter, search])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAdd = () => {
    const assets = mockDAMAssets.filter((a) => selected.has(a.id)).map((a) => ({
      id: a.id,
      name: a.filename,
      url: a.thumbnailUrl,
      thumbnailUrl: a.thumbnailUrl,
    }))
    onAdd(assets)
    setSelected(new Set())
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex flex-col w-full max-w-4xl max-h-[85vh] rounded-3xl bg-[#111111] border border-white/10 overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Digital Asset Manager</h2>
            <p className="mt-0.5 text-sm text-white/50">Select assets from your DAM library</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-white/10 space-y-3">
          {/* Type tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 w-fit">
            {ASSET_TYPES.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveType(tab.value as typeof activeType)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeType === tab.value
                    ? 'bg-white text-gray-900'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search + Campaign filter */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search assets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-all"
              />
            </div>

            {/* Campaign filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => setCampaignFilter((f) => (f === '' ? CAMPAIGN_TAGS[0] ?? '' : f === CAMPAIGN_TAGS[0] ? '' : CAMPAIGN_TAGS[0] ?? ''))}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {campaignFilter || 'All Campaigns'}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
                  <path d="M2 4h8M4 7h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {campaignFilter !== '' && (
                <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-[#1a1a1a] border border-white/10 overflow-hidden shadow-2xl z-20">
                  <button
                    onClick={() => setCampaignFilter('')}
                    className="w-full text-left px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5"
                  >
                    All Campaigns
                  </button>
                  {CAMPAIGN_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setCampaignFilter(tag)}
                      className="w-full text-left px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors border-t border-white/5"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Asset grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Search size={24} className="text-white/20" />
              </div>
              <p className="text-white/50 text-sm">No assets found</p>
              <p className="text-white/30 text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filtered.map((asset) => {
                const isSelected = selected.has(asset.id)
                return (
                  <div
                    key={asset.id}
                    onClick={() => toggle(asset.id)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-white ring-2 ring-white/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="aspect-square relative bg-black/40">
                      <img
                        src={asset.thumbnailUrl}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                      {/* Selection overlay */}
                      {isSelected && <div className="absolute inset-0 bg-white/20" />}
                      {/* Check mark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                          <Check size={12} className="text-gray-900" />
                        </div>
                      )}
                      {/* Tag badge */}
                      <div className="absolute bottom-2 left-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 backdrop-blur-sm text-white/80 border border-white/10">
                          {asset.campaignTag}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white/5">
                      <p className="text-[11px] text-white/70 line-clamp-1 leading-tight">{asset.filename}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 line-clamp-1">{asset.dimensionLabel}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-white/40">
            {selected.size > 0 ? `${selected.size} asset${selected.size !== 1 ? 's' : ''} selected` : 'Click to select assets'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-semibold bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add {selected.size > 0 ? `${selected.size} Asset${selected.size !== 1 ? 's' : ''}` : 'Asset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
