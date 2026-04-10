import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Image as ImageIcon } from 'lucide-react'
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
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Image Editor</h1>
          <p className="mt-1 text-sm text-white/50">Resume in-progress edits or start a new prompt-driven canvas session.</p>
        </div>
        <button
          onClick={() => navigate('/image-editor/new')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-frnd-dark text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6">
            <ImageIcon size={32} className="text-white/20" />
          </div>
          <h2 className="text-lg font-medium text-white/60 mb-2">No projects yet</h2>
          <p className="text-sm text-white/30 mb-6 max-w-xs mx-auto">Start your first Image Editor project to retouch, erase, and generate content.</p>
          <button
            onClick={() => navigate('/image-editor/new')}
            className="px-5 py-2.5 bg-white text-frnd-dark text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={15} /> Start your first project
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
                className="group flex flex-col items-start p-3 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/[0.08] transition-all text-left"
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
                <div className="text-[11px] text-white/30 mt-2">
                  Last edited {new Date(proj.lastEditedAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
