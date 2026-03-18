import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PenTool, Search, Plus, Image as ImageIcon } from 'lucide-react'
import { useImageEditorStore } from '../../store/useImageEditorStore'

export default function ImageEditorDashboardPage() {
  const navigate = useNavigate()
  const { projects, loadProject } = useImageEditorStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | 'From Projects' | 'My Uploads'>('All')

  const filtered = useMemo(() => {
    let list = projects
    if (filter === 'From Projects') list = list.filter(p => !!p.sourceProjectId)
    if (filter === 'My Uploads') list = list.filter(p => !p.sourceProjectId)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }
    return list
  }, [projects, search, filter])

  const handleOpenProject = (id: string) => {
    loadProject(id)
    navigate('/image-editor/edit')
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cimb-red/10 rounded-xl flex items-center justify-center shrink-0">
            <PenTool size={24} className="text-cimb-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Image Editor Projects</h1>
            <p className="text-sm text-gray-500">Resume in-progress edits or start a new prompt-driven canvas session.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/image-editor/new')}
          className="flex items-center gap-2 px-4 py-2 bg-cimb-red text-white text-sm font-medium rounded-lg hover:bg-red-800"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-sm text-gray-500 mb-6">Start your first Image Editor project to retouch, erase, and generate content.</p>
          <button
            onClick={() => navigate('/image-editor/new')}
            className="px-6 py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 inline-flex items-center gap-2"
          >
            <Plus size={16} /> Start your first project
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cimb-red bg-white"
            >
              <option value="All">All Sources</option>
              <option value="From Projects">From KV Generator</option>
              <option value="My Uploads">My Uploads</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(proj => (
              <button
                key={proj.id}
                onClick={() => handleOpenProject(proj.id)}
                className="group flex flex-col items-start p-3 bg-white border border-gray-200 rounded-xl hover:border-cimb-red/30 hover:shadow-sm transition-all text-left"
              >
                <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {proj.thumbnailUrl ? (
                    <img src={proj.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon size={24} className="text-gray-300" /></div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 truncate w-full mb-1 group-hover:text-cimb-red transition-colors">{proj.name}</h3>
                <div className="flex items-center gap-2 w-full">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium uppercase tracking-wider rounded-full border border-gray-200 truncate">
                    {proj.sourceProjectId && proj.sourceProjectName ? `From ${proj.sourceProjectName}` : 'My Upload'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <span>Last edited {new Date(proj.lastEditedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
