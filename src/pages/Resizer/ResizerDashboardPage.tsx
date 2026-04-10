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
    navigate(`/resizer/projects/${id}`)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteProject(id)
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Resizer</h1>
          <p className="mt-1 text-sm text-white/50">Pick up where you left off or start a new platform resizing job.</p>
        </div>
        <button
          onClick={() => navigate('/resizer/new')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-frnd-dark text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Plus size={15} /> New Resizer Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <Maximize2 size={32} className="text-white/20" />
          </div>
          <h2 className="text-lg font-medium text-white/60 mb-2">Start your first project</h2>
          <p className="text-sm text-white/30 mb-6 max-w-xs mx-auto">Upload an image to begin resizing across platforms.</p>
          <button
            onClick={() => navigate('/resizer/new')}
            className="px-5 py-2.5 bg-white text-frnd-dark text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={15} /> New Project
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'All' | 'From Projects' | 'My Uploads')}
              className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
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
                className="group relative flex flex-col items-start p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.08] transition-all text-left"
              >
                <div className="w-full aspect-square bg-black/40 rounded-xl overflow-hidden mb-3 border border-white/[0.06]">
                  {proj.thumbnailUrl ? (
                    <img src={proj.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={24} className="text-white/20" />
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-white truncate w-full mb-1.5">{proj.name}</h3>
                <span className="px-2 py-0.5 bg-white/10 text-white/50 text-[10px] font-medium uppercase tracking-wider rounded-full border border-white/10 truncate max-w-full">
                  {proj.sourceProjectId && proj.sourceProjectName ? `From ${proj.sourceProjectName}` : 'My Upload'}
                </span>
                <div className="text-[11px] text-white/30 mt-2 flex items-center justify-between w-full">
                  <span>Last edited {new Date(proj.lastEditedAt).toLocaleDateString()}</span>
                  <span>{proj.selectedDimIds.length} sizes</span>
                </div>

                {/* Delete button (hover) */}
                <div
                  className="absolute top-3 right-3 p-1.5 bg-white/10 rounded-lg border border-white/10 text-white/30 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20"
                  onClick={(e) => handleDelete(e, proj.id)}
                >
                  <Trash2 size={13} />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
