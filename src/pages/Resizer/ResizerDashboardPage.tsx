import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Maximize2, Search, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { useResizerStore } from '../../store/useResizerStore'

export default function ResizerDashboardPage() {
  const navigate = useNavigate()
  const { projects, deleteProject, loadProject } = useResizerStore()
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
    navigate(`/resizer/projects/${id}`) // the actual resize session flow
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteProject(id)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cimb-red/10 rounded-xl flex items-center justify-center shrink-0">
            <Maximize2 size={24} className="text-cimb-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Resizer Projects</h1>
            <p className="text-sm text-gray-500">Pick up where you left off or start a new platform resizing job.</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/resizer/new')}
          className="flex items-center gap-2 px-4 py-2 bg-cimb-red text-white text-sm font-medium rounded-lg hover:bg-red-800"
        >
          <Plus size={16} /> New Resizer Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <Maximize2 size={48} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Start your first project</h2>
          <p className="text-sm text-gray-500 mb-6">Upload an image to begin resizing.</p>
          <button
            onClick={() => navigate('/resizer/new')}
            className="px-6 py-3 bg-cimb-red text-white text-sm font-semibold rounded-xl hover:bg-red-800 inline-flex items-center gap-2"
          >
            <Plus size={16} /> New Project
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
                className="group relative flex flex-col items-start p-3 bg-white border border-gray-200 rounded-xl hover:border-cimb-red/30 hover:shadow-sm transition-all text-left"
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
                <div className="text-xs text-gray-400 mt-2 flex items-center justify-between w-full">
                  <span>Last edited {new Date(proj.lastEditedAt).toLocaleDateString()}</span>
                  <span>{proj.selectedDimIds.length} sizes</span>
                </div>

                {/* Delete button (hover) */}
                <div 
                  className="absolute top-4 right-4 p-1.5 bg-white rounded-md border border-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-200 focus:opacity-100"
                  onClick={(e) => handleDelete(e, proj.id)}
                >
                  <Trash2 size={14} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
