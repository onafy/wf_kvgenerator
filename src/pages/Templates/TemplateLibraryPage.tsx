import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Star, Users, Layers, Clock, ChevronRight, Trash2 } from 'lucide-react'
import { useTemplateStore } from '../../store/useTemplateStore'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import type { Template, TemplateOrigin } from '../../types'

type OriginFilter = 'all' | TemplateOrigin

function TemplateCard({ template, onUse, onDelete }: { template: Template; onUse: () => void; onDelete: () => void }) {
  const originLabel = template.originTool === 'KVGenerator' ? 'KV Generator' : 'Image Editor'
  const originColor = template.originTool === 'KVGenerator' ? 'bg-cimb-red text-white' : 'bg-violet-600 text-white'

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img src={template.thumbnailUrl} alt={template.name} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${originColor}`}>{originLabel}</span>
          {template.isPersonal && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-900/70 text-white">Personal</span>}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{template.name}</h3>
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <div className="flex items-center gap-1"><Users size={11} /> {template.creatorName}</div>
          <div className="flex items-center justify-between">
            <span>{template.segment}</span>
            <span className="flex items-center gap-1"><Clock size={10} /> Used {template.usageCount}×</span>
          </div>
          <div>Saved {new Date(template.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg hover:border-red-200 transition-colors">
            <Trash2 size={13} />
          </button>
          <button onClick={onUse} className="flex-1 py-2 bg-cimb-red text-white text-xs font-medium rounded-lg hover:bg-red-800 flex items-center justify-center gap-1">
            Use Template <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TemplateLibraryPage() {
  const navigate = useNavigate()
  const { templates, activeTab, setActiveTab, searchQuery, setSearchQuery, deleteTemplate } = useTemplateStore()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [originFilter, setOriginFilter] = useState<OriginFilter>('all')

  const myTemplates = templates.filter((t) => t.isPersonal)
  const teamTemplates = templates.filter((t) => !t.isPersonal)
  const displayed = (activeTab === 'my' ? myTemplates : teamTemplates).filter((t) => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.segment.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesOrigin = originFilter === 'all' || t.originTool === originFilter
    return matchesSearch && matchesOrigin
  })

  const handleUse = (template: Template) => {
    navigate(`/kv-generator/templates/${template.id}/setup`)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Layers size={20} className="text-cimb-red" /> Template Library</h2>
          <p className="text-sm text-gray-500 mt-0.5">Reusable spatial layouts shared between KV Generator and Image Editor</p>
        </div>
      </div>

      {/* Tabs + filters + search */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[{ key: 'team', label: 'Team Templates', icon: <Users size={13} /> }, { key: 'my', label: 'My Templates', icon: <Star size={13} /> }].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Origin filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {([['all', 'All'], ['KVGenerator', 'KV Generator'], ['ImageEditor', 'Image Editor']] as [OriginFilter, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setOriginFilter(key)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${originFilter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search templates..." className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red" />
        </div>
      </div>

      {displayed.length === 0 ? (
        <div className="text-center py-20">
          <Layers size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No templates found</p>
          <p className="text-xs text-gray-400 mt-1">Save a template from the KV Generator or Image Editor to see it here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((template) => (
            <TemplateCard key={template.id} template={template} onUse={() => handleUse(template)} onDelete={() => setDeleteTarget(template.id)} />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Template"
          message="This template will be permanently deleted. Projects that used it won't be affected."
          confirmLabel="Delete Template"
          danger
          onConfirm={() => { deleteTemplate(deleteTarget); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
