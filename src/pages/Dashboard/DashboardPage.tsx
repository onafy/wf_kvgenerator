import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LayoutTemplate, Search, Filter, MoreVertical, Clock, CheckCircle2, FileEdit, Trash2, Copy, ExternalLink, Link2 } from 'lucide-react'
import { useProjectStore, useFilteredProjects } from '../../store/useProjectStore'
import { useExportStore } from '../../store/useExportStore'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { EmptyState } from '../../components/shared/EmptyState'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import type { Project } from '../../types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ProjectCard({ project, onDuplicate, onDelete }: { project: Project; onDuplicate: () => void; onDelete: () => void }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // PRD KV Generator 9.F RD-21: "Share pending" nudge for exported projects with no active link
  const shareLinks = useExportStore((s) => s.shareLinks)
  const hasActiveShareLink = project.status === 'Exported' && shareLinks.some(
    (l) => l.projectId === project.id && !l.isRevoked && new Date(l.expiresAt) > new Date()
  )
  const showShareNudge = project.status === 'Exported' && !hasActiveShareLink

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer" onClick={() => navigate(`/kv-generator/projects/${project.id}`)}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img src={project.thumbnailUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* More menu */}
        <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <MoreVertical size={14} className="text-gray-700" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-100 py-1 w-44 z-10">
              <button onClick={() => { navigate(`/kv-generator/projects/${project.id}`); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <ExternalLink size={14} /> Open Project
              </button>
              <button onClick={() => { onDuplicate(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Copy size={14} /> Duplicate
              </button>
              <hr className="my-1 border-gray-100" />
              <button onClick={() => { onDelete(); setMenuOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
        {/* PRD 9.F RD-21: soft nudge — exported but no share link yet */}
        {showShareNudge && (
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/kv-generator/projects/${project.id}/export`) }}
            className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mb-2 hover:bg-amber-100 transition-colors"
          >
            <Link2 size={10} /> Share link pending
          </button>
        )}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-medium text-gray-600">{project.segment}</span>
            <span>·</span>
            <span>{project.funnel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{project.creatorName}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(project.lastModifiedAt)}</span>
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KV Generator</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage Key Visual banners for CIMB campaigns</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/kv-generator/templates')} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <LayoutTemplate size={16} /> Use Template
          </button>
          <button onClick={() => navigate('/kv-generator/new')} className="flex items-center gap-2 px-4 py-2.5 bg-cimb-red text-white text-sm font-medium rounded-lg hover:bg-red-800 transition-colors">
            <Plus size={16} /> New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: total, icon: <FileEdit size={20} className="text-gray-400" /> },
          { label: 'In Progress', value: inProgress, icon: <Clock size={20} className="text-blue-400" /> },
          { label: 'Exported', value: exported, icon: <CheckCircle2 size={20} className="text-green-400" /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            {s.icon}
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-cimb-red/20 focus:border-cimb-red"
          />
        </div>
        <Filter size={15} className="text-gray-400 shrink-0" />
        {/* Status filter */}
        {['', 'Draft', 'InProgress', 'Exported'].map((s) => (
          <button
            key={s}
            onClick={() => setFilters({ status: s })}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${filters.status === s ? 'bg-cimb-red text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {s === '' ? 'All' : s === 'InProgress' ? 'In Progress' : s}
          </button>
        ))}
        {/* Segment filter */}
        <select
          value={filters.segment}
          onChange={(e) => setFilters({ segment: e.target.value })}
          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:border-cimb-red"
        >
          <option value="">All Segments</option>
          {['Youth', 'Family', 'Mass'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {/* Funnel filter */}
        <select
          value={filters.funnel}
          onChange={(e) => setFilters({ funnel: e.target.value })}
          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:border-cimb-red"
        >
          <option value="">All Funnels</option>
          {['Awareness', 'Consideration', 'Conversion'].map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileEdit size={48} />}
          title="No projects yet"
          description="Create your first KV project or start from a template to get going."
          primaryAction={{ label: 'Create Your First Project', onClick: () => navigate('/kv-generator/new') }}
          secondaryAction={{ label: 'Browse Templates', onClick: () => navigate('/kv-generator/templates') }}
        />
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
