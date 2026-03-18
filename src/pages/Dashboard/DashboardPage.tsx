import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutTemplate, Search, Filter, MoreVertical, Clock, CheckCircle2, FileEdit, Trash2, Copy, ExternalLink, Link2 } from 'lucide-react'
import { useProjectStore, useFilteredProjects } from '../../store/useProjectStore'
import { useExportStore } from '../../store/useExportStore'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import type { Project } from '../../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ProjectCard({ project, onDuplicate, onDelete }: { project: Project; onDuplicate: () => void; onDelete: () => void }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const shareLinks = useExportStore((s) => s.shareLinks)
  const hasActiveShareLink = project.status === 'Exported' && shareLinks.some(
    (l) => l.projectId === project.id && !l.isRevoked && new Date(l.expiresAt) > new Date()
  )
  const showShareNudge = project.status === 'Exported' && !hasActiveShareLink

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    Draft: { bg: 'bg-white/5', text: 'text-gray-400', label: 'Draft' },
    InProgress: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'In Progress' },
    Exported: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Exported' },
  }
  const status = statusColors[project.status] || statusColors.Draft

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer" onClick={() => navigate(`/kv-generator/projects/${project.id}`)}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-white/5">
        <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
        {/* More menu */}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
          >
            <MoreVertical size={14} className="text-white" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-gray-900/90 backdrop-blur-sm rounded-lg border border-white/10 py-1 w-44 z-10">
              <button onClick={() => { navigate(`/kv-generator/projects/${project.id}`); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10">
                <ExternalLink size={14} /> Open Project
              </button>
              <button onClick={() => { onDuplicate(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-white/10">
                <Copy size={14} /> Duplicate
              </button>
              <hr className="my-1 border-white/10" />
              <button onClick={() => { onDelete(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-1 mb-3">{project.name}</h3>

        {showShareNudge && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/kv-generator/projects/${project.id}/export`) }}
            className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 mb-3 hover:bg-amber-500/20 transition-colors"
          >
            <Link2 size={10} /> Share link pending
          </button>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-gray-400">{project.segment}</span>
            <span className="text-white/20">·</span>
            <span>{project.funnel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">{project.creatorName}</span>
            <span className="flex items-center gap-1 text-gray-600"><Clock size={11} /> {formatDate(project.lastModifiedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { filters, setFilters, duplicateProject, deleteProject } = useProjectStore()
  const filtered = useFilteredProjects()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const total = useProjectStore((s) => s.projects.length)
  const exported = useProjectStore((s) => s.projects.filter((p) => p.status === 'Exported').length)
  const inProgress = useProjectStore((s) => s.projects.filter((p) => p.status === 'InProgress').length)

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Your Projects</h1>
          <p className="text-sm text-gray-500">Create and manage Key Visual banners for CIMB campaigns</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/kv-generator/templates')} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 text-sm font-medium rounded-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
            <LayoutTemplate size={16} /> Use Template
          </button>
          <button onClick={() => navigate('/kv-generator/new')} className="flex items-center gap-2 px-4 py-2.5 bg-cimb-red text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Total Projects', value: total, icon: <FileEdit size={18} className="text-gray-500" /> },
          { label: 'In Progress', value: inProgress, icon: <Clock size={18} className="text-blue-400" /> },
          { label: 'Exported', value: exported, icon: <CheckCircle2 size={18} className="text-green-400" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
            {s.icon}
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cimb-red/50"
          />
        </div>
        <Filter size={15} className="text-gray-600 shrink-0" />
        {/* Status filter */}
        {['', 'Draft', 'InProgress', 'Exported'].map((s) => (
          <button
            key={s}
            onClick={() => setFilters({ status: s })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filters.status === s
                ? 'bg-white text-frnd-dark'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
            }`}
          >
            {s === '' ? 'All' : s === 'InProgress' ? 'In Progress' : s}
          </button>
        ))}
        {/* Segment filter */}
        <select
          value={filters.segment}
          onChange={(e) => setFilters({ segment: e.target.value })}
          className="px-3 py-1.5 text-xs border border-white/10 rounded-lg bg-white/5 text-gray-400 focus:outline-none focus:border-cimb-red/50"
        >
          <option value="" className="bg-gray-900">All Segments</option>
          {['Youth', 'Family', 'Mass'].map((s) => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
        </select>
        {/* Funnel filter */}
        <select
          value={filters.funnel}
          onChange={(e) => setFilters({ funnel: e.target.value })}
          className="px-3 py-1.5 text-xs border border-white/10 rounded-lg bg-white/5 text-gray-400 focus:outline-none focus:border-cimb-red/50"
        >
          <option value="" className="bg-gray-900">All Funnels</option>
          {['Awareness', 'Consideration', 'Conversion'].map((f) => <option key={f} value={f} className="bg-gray-900">{f}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FileEdit size={28} className="text-gray-600" />
          </div>
          <h3 className="text-white font-semibold mb-1">No projects yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first KV project or start from a template to get going.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/kv-generator/new')} className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors">
              Create Your First Project
            </button>
            <button onClick={() => navigate('/kv-generator/templates')} className="px-4 py-2 bg-white/5 text-gray-300 text-sm font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              Browse Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDuplicate={() => duplicateProject(project.id)}
              onDelete={() => setDeleteTarget(project.id)}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Project"
          message="This project will be moved to trash and permanently deleted after 30 days. You can recover it within that window."
          confirmLabel="Delete Project"
          danger
          onConfirm={() => { deleteProject(deleteTarget); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
