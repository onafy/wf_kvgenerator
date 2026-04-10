import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, X, Sparkles, Image as ImageIcon } from 'lucide-react'
import { useTemplateStore } from '../../store/useTemplateStore'
import type { Template, TemplateOrigin } from '../../types'

type OriginFilter = 'All' | TemplateOrigin
type SortOption = 'recent' | 'most_used' | 'newest'

const ORIGIN_LABELS: Record<OriginFilter, string> = {
  All: 'All',
  KVGenerator: 'KV Generator',
  ImageEditor: 'Image Editor',
}

function formatLastUsed(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return `Today, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
  }
  return d.toISOString().slice(0, 10)
}

// ── Template Card ───────────────────────────────────────────────────
function TemplateCard({ template, onPreview }: { template: Template; onPreview: () => void }) {
  return (
    <div
      onClick={onPreview}
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden group cursor-pointer hover:border-white/20 hover:bg-white/[0.05] hover:-translate-y-1 transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-black/40">
        <img
          src={template.thumbnailUrl}
          alt={template.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Origin badge — top left */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-md border ${
              template.originTool === 'KVGenerator'
                ? 'bg-white/20 text-white/90 border-white/20'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}
          >
            {template.originTool === 'KVGenerator' ? (
              <Sparkles className="w-3 h-3" />
            ) : (
              <ImageIcon className="w-3 h-3" />
            )}
            {template.originTool === 'KVGenerator' ? 'KV Generator' : 'Image Editor'}
          </span>
        </div>

        {/* Usage count — top right */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/70 border border-white/10">
            {template.usageCount} uses
          </span>
        </div>

        {/* Preview overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPreview()
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-2">
        <h4 className="text-sm font-medium text-white line-clamp-1">{template.name}</h4>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-white/40">{template.creatorName}</p>
          <p className="text-[10px] text-white/25">Last used {formatLastUsed(template.lastUsedAt)}</p>
        </div>
      </div>
    </div>
  )
}

// ── Template Detail Modal ───────────────────────────────────────────
function TemplateDetailModal({
  template,
  onClose,
  onApply,
}: {
  template: Template
  onClose: () => void
  onApply: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#111] border border-white/10 overflow-hidden shadow-2xl">
        {/* Preview header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white">{template.name}</h3>
            <p className="text-xs text-white/40 mt-0.5">Template Preview</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Thumbnail with bounding box overlay */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40">
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0">
              {/* Bounding box overlays */}
              {template.boundingBoxes.map((box) => (
                <div
                  key={box.id}
                  className="absolute border-2 border-dashed border-yellow-400/60 bg-yellow-400/5"
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                >
                  <span className="absolute -top-5 left-0 text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/80 text-gray-900 font-medium whitespace-nowrap">
                    {box.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-xs text-white/60">Bounding box overlay shown on thumbnail</p>
            </div>
          </div>

          {/* Bounding boxes details */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Bounding Boxes ({template.boundingBoxes.length})
            </p>
            {template.boundingBoxes.map((box) => (
              <div key={box.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{box.label}</p>
                  <p className="text-xs text-white/40 mt-0.5 italic">&ldquo;{box.description}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>By {template.creatorName}</span>
            <span>Used {template.usageCount} times</span>
            <span>Created {template.createdAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onApply}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-900 bg-white hover:bg-white/90 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Apply Template
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Template Library Page ───────────────────────────────────────────
export default function TemplateLibraryPage() {
  const navigate = useNavigate()
  const { templates, searchQuery, setSearchQuery } = useTemplateStore()
  const [activeFilter, setActiveFilter] = useState<OriginFilter>('All')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const filtered = useMemo(() => {
    return [...templates]
      .filter((t) => {
        const matchesSearch =
          !searchQuery ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesOrigin = activeFilter === 'All' || t.originTool === activeFilter
        return matchesSearch && matchesOrigin
      })
      .sort((a, b) => {
        if (sortBy === 'most_used') return b.usageCount - a.usageCount
        if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt)
        return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      })
  }, [templates, searchQuery, activeFilter, sortBy])

  const kvCount = templates.filter((t) => t.originTool === 'KVGenerator').length
  const ieCount = templates.filter((t) => t.originTool === 'ImageEditor').length

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-2 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Template Library</h1>
          <p className="mt-1 text-sm text-white/50">Shared templates from KV Generator and Image Editor</p>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
            >
              <option value="recent">Recently Used</option>
              <option value="most_used">Most Used</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Origin tabs — matching TabsRounded style */}
          <div className="flex items-start justify-start backdrop-blur-md bg-white/15 p-1 rounded-[32px] w-fit">
            {(['All', 'KVGenerator', 'ImageEditor'] as OriginFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 h-8 px-3 py-[6px] rounded-full text-sm font-medium leading-[1.4] whitespace-nowrap transition-all duration-300 ease-in-out shadow-[0_4px_8px_0_rgba(0,0,0,0.04)] ${
                  activeFilter === filter
                    ? 'bg-white text-gray-900'
                    : 'bg-transparent text-white'
                }`}
              >
                {ORIGIN_LABELS[filter]}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <span className="text-white/40">
            <span className="text-white font-medium">{filtered.length}</span> templates
          </span>
          <span className="text-white/30">{kvCount} from KV Generator</span>
          <span className="text-white/30">{ieCount} from Image Editor</span>
        </div>

        {/* Template grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-lg font-medium text-white/60">No templates found</h3>
            <p className="text-sm text-white/30 mt-2 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Templates saved from KV Generator and Image Editor will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filtered.map((t) => (
              <TemplateCard key={t.id} template={t} onPreview={() => setPreviewTemplate(t)} />
            ))}
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplateDetailModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onApply={() => {
            const id = previewTemplate.id
            setPreviewTemplate(null)
            navigate(`/kv-generator/new?template=${id}`)
          }}
        />
      )}
    </div>
  )
}
