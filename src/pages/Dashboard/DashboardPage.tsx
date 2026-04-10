import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Sparkles,
  Search,
  LayoutGrid,
  List,
  FileEdit,
  Clock,
  CheckCircle2,
  Trash2,
  Copy,
  ExternalLink,
  Link2,
} from 'lucide-react'
import { useProjectStore, useFilteredProjects } from '../../store/useProjectStore'
import { useExportStore } from '../../store/useExportStore'
import { mockTemplates } from '../../mock'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import type { Project } from '../../types'

type SortOption = 'lastModified' | 'name'
type ViewMode = 'grid' | 'list'

const SEGMENT_OPTIONS = ['All', 'Youth', 'Family', 'Mass']

const STATUS_STYLES: Record<string, string> = {
  Draft: 'bg-white/10 text-white/70',
  InProgress: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Exported: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
}

const STATUS_LABELS: Record<string, string> = {
  Draft: 'Draft',
  InProgress: 'In Progress',
  Exported: 'Exported',
}

const SEGMENT_COLORS: Record<string, string> = {
  Youth: 'bg-purple-500/20 text-purple-300',
  Family: 'bg-orange-500/20 text-orange-300',
  Mass: 'bg-teal-500/20 text-teal-300',
}

function formatRelativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `Today, ${new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
  if (days === 1) return 'Yesterday'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function ProjectCardGrid({
  project,
  onDuplicate,
  onDelete,
}: {
  project: Project
  onDuplicate: () => void
  onDelete: () => void
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const shareLinks = useExportStore((s) => s.shareLinks)
  const hasActiveShareLink = project.status === 'Exported' && shareLinks.some(
    (l) => l.projectId === project.id && !l.isRevoked && new Date(l.expiresAt) > new Date()
  )
  const showShareNudge = project.status === 'Exported' && !hasActiveShareLink

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/kv-generator/projects/${project.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden bg-black/40">
        <img
          src={project.thumbnailUrl}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium backdrop-blur-md',
              STATUS_STYLES[project.status] || STATUS_STYLES.Draft
            )}
          >
            {STATUS_LABELS[project.status] || project.status}
          </span>
        </div>

        {/* Open in new tab */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/kv-generator/projects/${project.id}`)
          }}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70"
        >
          <ExternalLink size={15} />
        </button>

        {/* Variants count badge */}
        {project.status !== 'Draft' && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-md text-white/80 border border-white/10">
              4 options
            </span>
          </div>
        )}

        {/* Options menu */}
        <div
          className="absolute bottom-3 right-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M1 3h14M3 8h10M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-xl bg-[#1a1a1a] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
              <button
                onClick={() => {
                  navigate(`/kv-generator/projects/${project.id}`)
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ExternalLink size={16} className="shrink-0" />
                Open Project
              </button>
              <button
                onClick={() => {
                  onDuplicate()
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Copy size={16} className="shrink-0" />
                Duplicate
              </button>
              <div className="border-t border-white/10" />
              <button
                onClick={() => {
                  onDelete()
                  setMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <Trash2 size={16} className="shrink-0" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-white leading-tight line-clamp-1 mb-2">
          {project.name}
        </h3>

        {showShareNudge && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/kv-generator/projects/${project.id}/export`)
            }}
            className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 mb-2 hover:bg-amber-500/20 transition-colors"
          >
            <Link2 size={10} />
            Share link pending
          </button>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium',
              SEGMENT_COLORS[project.segment] ?? 'bg-white/10 text-white/60'
            )}
          >
            {project.segment}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/60">
            {project.funnel}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-white/40">{project.creatorName}</span>
          <span className="text-[11px] text-white/40 flex items-center gap-1">
            <Clock size={10} />
            {formatRelativeDate(project.lastModifiedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

function ProjectRow({
  project,
  onOpen,
}: {
  project: Project
  onOpen: (id: string) => void
}) {
  return (
    <div
      onClick={() => onOpen(project.id)}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/3 border border-white/10 hover:border-white/20 hover:bg-white/5 cursor-pointer transition-all"
    >
      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
        <img
          src={project.thumbnailUrl}
          alt={project.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{project.name}</p>
        <p className="text-xs text-white/40 mt-0.5">{project.creatorName}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/60">
          {project.segment}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/10 text-white/60">
          {STATUS_LABELS[project.status] || project.status}
        </span>
      </div>
      <p className="text-xs text-white/30 w-20 text-right">
        {formatRelativeDate(project.lastModifiedAt)}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { filters, setFilters, duplicateProject, deleteProject } = useProjectStore()
  const filtered = useFilteredProjects()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('lastModified')

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return b.lastModifiedAt.localeCompare(a.lastModifiedAt)
    })
  }, [filtered, sortBy])

  const total = useProjectStore((s) => s.projects.length)
  const exported = useProjectStore((s) => s.projects.filter((p) => p.status === 'Exported').length)
  const inProgress = useProjectStore((s) => s.projects.filter((p) => p.status === 'InProgress').length)
  const drafts = useProjectStore((s) => s.projects.filter((p) => p.status === 'Draft').length)
  const templateCount = mockTemplates.length

  const activeFiltersCount = [
    filters.status !== '',
    filters.segment !== '',
    filters.funnel !== '',
  ].filter(Boolean).length

  const hasActiveFilters = filters.search || filters.status || filters.segment || filters.funnel

  const openProject = (id: string) => navigate(`/kv-generator/projects/${id}`)

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">KV Generator</h1>
          <p className="mt-1 text-sm text-white/50">
            AI-powered Key Visual production for CIMB campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/kv-generator/templates')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/60 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/10 hover:text-white transition-all"
          >
            <Sparkles size={15} />
            Browse Templates
          </button>
          <button
            onClick={() => navigate('/kv-generator/new')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-frnd-dark text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Plus size={15} />
            New Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Total Projects',
            value: total,
            sub: `${drafts} drafts`,
            icon: <FileEdit size={15} className="text-white/30" />,
          },
          {
            label: 'In Progress',
            value: inProgress,
            sub: 'Active work',
            icon: <Clock size={15} className="text-blue-400/70" />,
          },
          {
            label: 'Exported',
            value: exported,
            sub: 'Completed',
            icon: <CheckCircle2 size={15} className="text-emerald-400/70" />,
          },
          {
            label: 'Templates',
            value: templateCount,
            sub: 'Available',
            icon: <Sparkles size={15} className="text-purple-400/70" />,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white/5 border border-white/10 p-4"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-2xl font-semibold text-white">{s.value}</p>
              {s.icon}
            </div>
            <p className="text-xs font-medium text-white/60 mt-1">{s.label}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all"
            />
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 h-10 text-sm font-medium rounded-xl border transition-all',
              showFilters
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
            )}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-gray-900 text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
          >
            <option value="lastModified">Last Modified</option>
            <option value="name">Name</option>
          </select>

          {/* View mode */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-white text-gray-900'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-white text-gray-900'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex items-center gap-4 pt-2 pb-1 flex-wrap">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 whitespace-nowrap">Status:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
                {['', 'Draft', 'InProgress', 'Exported'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ status: s })}
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                      filters.status === s
                        ? 'bg-white text-gray-900'
                        : 'text-white/50 hover:text-white'
                    )}
                  >
                    {s === '' ? 'All' : STATUS_LABELS[s] || s}
                  </button>
                ))}
              </div>
            </div>

            {/* Segment */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 whitespace-nowrap">Segment:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
                {SEGMENT_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      setFilters({ segment: s === 'All' ? '' : s })
                    }
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                      (s === 'All' ? filters.segment === '' : filters.segment === s)
                        ? 'bg-white text-gray-900'
                        : 'text-white/50 hover:text-white'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Funnel */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 whitespace-nowrap">Funnel:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5">
                {['All', 'Awareness', 'Consideration', 'Conversion'].map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      setFilters({ funnel: f === 'All' ? '' : f })
                    }
                    className={cn(
                      'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                      (f === 'All' ? filters.funnel === '' : filters.funnel === f)
                        ? 'bg-white text-gray-900'
                        : 'text-white/50 hover:text-white'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-white/5 bg-white/[0.02]">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
            <Sparkles size={32} className="text-white/20" />
          </div>

          {hasActiveFilters ? (
            <>
              <h3 className="text-lg font-medium text-white/60 mb-2">
                No matching projects
              </h3>
              <p className="text-sm text-white/30 max-w-xs mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() =>
                  setFilters({ search: '', status: '', segment: '', funnel: '' })
                }
                className="px-4 py-2 bg-white/5 text-white/60 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-white/60 mb-2">
                No projects yet
              </h3>
              <p className="text-sm text-white/30 max-w-xs mb-6">
                Create your first KV project or start from a template.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/kv-generator/new')}
                  className="px-4 py-2 bg-white text-frnd-dark text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  New Project
                </button>
                <button
                  onClick={() => navigate('/kv-generator/templates')}
                  className="px-4 py-2 bg-white/5 text-white/60 text-sm font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                >
                  Browse Templates
                </button>
              </div>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {sorted.map((project) => (
            <ProjectCardGrid
              key={project.id}
              project={project}
              onDuplicate={() => duplicateProject(project.id)}
              onDelete={() => setDeleteTarget(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              onOpen={openProject}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Project"
          message="This project will be permanently deleted."
          confirmLabel="Delete Project"
          danger
          onConfirm={() => {
            deleteProject(deleteTarget)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
