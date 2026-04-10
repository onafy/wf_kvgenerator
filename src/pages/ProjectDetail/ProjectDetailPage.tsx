import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Edit3, Download, Clock, Copy, Trash2, Link2, CheckCircle2, Image as ImageIcon, Maximize2 } from 'lucide-react'
import { useProjectStore } from '../../store/useProjectStore'
import { useVersionStore } from '../../store/useVersionStore'
import { useGenerationStore } from '../../store/useGenerationStore'
import { useExportStore } from '../../store/useExportStore'
import { useImageEditorStore } from '../../store/useImageEditorStore'
import { useResizerStore } from '../../store/useResizerStore'
import { StatusBadge } from '../../components/shared/StatusBadge'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProject, duplicateProject, deleteProject } = useProjectStore()
  const { getVersions } = useVersionStore()
  const { getVariants } = useGenerationStore()
  const { exportHistory, shareLinks, generateShareLink, revokeShareLink } = useExportStore()

  const [expiryDays, setExpiryDays] = useState(7)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)

  // Always call hooks unconditionally before any early return
  const { projects: ieProjects } = useImageEditorStore()
  const { projects: rzProjects } = useResizerStore()

  const project = getProject(id || '')
  const versions = getVersions(id || '')
  const variants = getVariants(id || '')
  const projectExports = exportHistory.filter((e) => e.projectId === id)
  const projectLinks = shareLinks.filter((l) => l.projectId === id)

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-white/40">Project not found.</p>
        <button onClick={() => navigate('/kv-generator')} className="mt-4 text-sm text-white/60 hover:text-white underline">← Back to Dashboard</button>
      </div>
    )
  }

  const linkedProjects = [
    ...ieProjects
      .filter((p) => p.sourceProjectId === id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        tool: 'Image Editor',
        thumbnailUrl: p.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150',
        lastEditedAt: p.lastEditedAt,
        versionCount: 1,
        link: '/image-editor',
      })),
    ...rzProjects
      .filter((p) => p.sourceProjectId === id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        tool: 'Resizer',
        thumbnailUrl: p.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150',
        lastEditedAt: p.lastEditedAt,
        versionCount: p.selectedDimIds.length,
        link: `/resizer/projects/${p.id}`,
      }))
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-semibold text-white tracking-tight">{project.name}</h2>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span>{project.segment}</span>
            <span>·</span>
            <span>{project.funnel}</span>
            <span>·</span>
            <span>By {project.creatorName}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock size={13} /> {formatDate(project.lastModifiedAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => duplicateProject(project.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            <Copy size={14} /> Duplicate
          </button>
          <button
            onClick={() => navigate(`/kv-generator/projects/${project.id}/edit`)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-frnd-dark bg-white rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Edit3 size={14} /> Open Editor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Variants */}
        <div className="col-span-2 space-y-6">
          {/* Generated Variants */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-medium text-white mb-4">Generated Variants ({variants.length})</h3>
            {variants.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No variants yet. Open the editor to generate.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {variants.slice(0, 6).map((v) => (
                  <div key={v.id} className="rounded-xl overflow-hidden border border-white/10">
                    <img src={v.thumbnailUrl} alt="" className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-medium text-white mb-4">Version History ({versions.length})</h3>
            {versions.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No versions recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {[...versions].reverse().map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <img src={v.thumbnailUrl} alt="" className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-white/80">v{v.versionNumber}</span>
                        <span className="text-xs text-white/40">{v.action}</span>
                        {v.isGeneratedWithPreviousContext && (
                          <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">Prev. context</span>
                        )}
                      </div>
                      <p className="text-xs text-white/40 truncate">{v.promptSummary}</p>
                      <p className="text-[11px] text-white/25 mt-0.5">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creative Activity */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-medium text-white mb-4">Creative Activity</h3>
            {linkedProjects.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-8">No linked projects found in other tools.</p>
            ) : (
              <div className="space-y-3">
                {linkedProjects.map((lp) => (
                  <div
                    key={lp.id}
                    className="flex items-center gap-4 p-4 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.03] transition-all cursor-pointer"
                    onClick={() => navigate(lp.link)}
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-black/40 border border-white/10">
                      <img src={lp.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-black/60 backdrop-blur text-white/70 p-1 rounded-md">
                        {lp.tool === 'Image Editor' ? <ImageIcon size={12} /> : <Maximize2 size={12} />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white truncate">{lp.name}</h4>
                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10">{lp.tool}</span>
                      </div>
                      <p className="text-xs text-white/40 mb-2">
                        {lp.versionCount} {lp.tool === 'Image Editor' ? 'versions' : 'sizes'} · Last edited {formatDate(lp.lastEditedAt)}
                      </p>
                      <button className="text-xs font-medium text-white/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors">
                        Resume in {lp.tool}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Actions</h3>
            <button
              onClick={() => navigate(`/kv-generator/projects/${project.id}/generate`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              <Edit3 size={14} className="text-white/30" /> Generate New Variants
            </button>
            <button
              onClick={() => navigate(`/kv-generator/projects/${project.id}/export`)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white/70 bg-white/[0.03] border border-white/[0.06] rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              <Download size={14} className="text-white/30" /> Export Package
            </button>
            <div className="border-t border-white/[0.06] my-1" />
            <button
              onClick={() => { deleteProject(project.id); navigate('/kv-generator') }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <Trash2 size={14} /> Delete Project
            </button>
          </div>

          {/* Export history */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Export History</h3>
            {projectExports.length === 0 ? (
              <p className="text-xs text-white/25">No exports yet</p>
            ) : (
              <div className="space-y-2">
                {projectExports.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-xs">
                    <span className="text-white/50">{new Date(e.exportedAt).toLocaleDateString()}</span>
                    <span className="text-white/30">{e.fileCount} files</span>
                    <a href={e.downloadUrl} className="text-white/60 hover:text-white flex items-center gap-1 transition-colors">
                      <Download size={10} /> Re-download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share links */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Share Links ({projectLinks.length})</h3>

            {/* Generate share link */}
            <div className="mb-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <p className="text-xs font-medium text-white/60 mb-2">Generate new link</p>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-white/40 shrink-0">Expires in</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70 focus:outline-none focus:border-white/30 cursor-pointer"
                >
                  {[3, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>
              {generatedToken ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1.5">
                    <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-mono text-emerald-300 truncate flex-1">{generatedToken}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${generatedToken}`) }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 shrink-0 font-medium transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    onClick={() => setGeneratedToken(null)}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    Generate another
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const link = generateShareLink('', project.id, expiryDays)
                    setGeneratedToken(link.token)
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-frnd-dark bg-white rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Link2 size={11} /> Generate & Copy Link
                </button>
              )}
            </div>

            {projectLinks.length === 0 ? (
              <p className="text-xs text-white/25">No share links yet</p>
            ) : (
              <div className="space-y-2">
                {projectLinks.map((l) => {
                  const expired = new Date(l.expiresAt) < new Date()
                  return (
                    <div key={l.id} className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${l.isRevoked || expired ? 'bg-white/20' : 'bg-emerald-400'}`} />
                        <span className={`font-mono truncate flex-1 ${l.isRevoked || expired ? 'text-white/25' : 'text-white/50'}`}>{l.token}</span>
                        {!l.isRevoked && !expired && (
                          <button
                            onClick={() => revokeShareLink(l.token)}
                            className="text-white/20 hover:text-red-400 shrink-0 transition-colors"
                            title="Revoke link"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="text-white/25 mt-0.5 pl-3.5">
                        {l.isRevoked ? 'Revoked' : expired ? 'Expired' : `Expires ${new Date(l.expiresAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
