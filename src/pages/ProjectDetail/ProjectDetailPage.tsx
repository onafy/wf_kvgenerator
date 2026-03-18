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

  const project = getProject(id || '')
  const versions = getVersions(id || '')
  const variants = getVariants(id || '')
  const projectExports = exportHistory.filter((e) => e.projectId === id)
  const projectLinks = shareLinks.filter((l) => l.projectId === id)

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-500">Project not found.</p>
        <button onClick={() => navigate('/kv-generator')} className="mt-4 text-sm text-cimb-red hover:underline">← Back to Dashboard</button>
      </div>
    )
  }

  const { projects: ieProjects } = useImageEditorStore()
  const { projects: rzProjects } = useResizerStore()

  const linkedProjects = [
    ...ieProjects
      .filter((p) => p.sourceProjectId === id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        tool: 'Image Editor',
        thumbnailUrl: p.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150',
        lastEditedAt: p.lastEditedAt,
        versionCount: 1, // simplified representation
        link: '/image-editor', // could link direct but IE currently loads via context
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
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
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
          <button onClick={() => duplicateProject(project.id)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <Copy size={14} /> Duplicate
          </button>
          <button onClick={() => navigate(`/kv-generator/projects/${project.id}/edit`)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800">
            <Edit3 size={14} /> Open Editor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Variants */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Generated Variants ({variants.length})</h3>
            {variants.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No variants yet. Open the editor to generate.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {variants.slice(0, 6).map((v) => (
                  <div key={v.id} className="rounded-lg overflow-hidden border border-gray-100">
                    <img src={v.thumbnailUrl} alt="" className="w-full aspect-square object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Version History */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Version History ({versions.length})</h3>
            {versions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No versions recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {[...versions].reverse().map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={v.thumbnailUrl} alt="" className="w-12 h-12 object-cover rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-gray-700">v{v.versionNumber}</span>
                        <span className="text-xs text-gray-500">{v.action}</span>
                        {v.isGeneratedWithPreviousContext && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Prev. context</span>}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{v.promptSummary}</p>
                      <p className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Creative Activity (Cross-Tool Linking) */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Creative Activity</h3>
            {linkedProjects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No linked projects found in other tools.</p>
            ) : (
              <div className="space-y-4">
                {linkedProjects.map((lp) => (
                  <div key={lp.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-cimb-red/30 hover:bg-red-50/20 transition-all group cursor-pointer" onClick={() => navigate(lp.link)}>
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                      <img src={lp.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1 left-1 bg-white/90 backdrop-blur text-gray-700 p-1 rounded-md shadow-sm">
                        {lp.tool === 'Image Editor' ? <ImageIcon size={12} /> : <Maximize2 size={12} />}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">{lp.name}</h4>
                        <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{lp.tool}</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {lp.versionCount} {lp.tool === 'Image Editor' ? 'versions' : 'sizes'} · Last edited {formatDate(lp.lastEditedAt)}
                      </p>
                      <button className="text-xs font-medium text-cimb-red bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-cimb-red hover:bg-red-50 transition-colors">
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
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
            <button onClick={() => navigate(`/kv-generator/projects/${project.id}/generate`)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
              <Edit3 size={14} className="text-gray-400" /> Generate New Variants
            </button>
            <button onClick={() => navigate(`/kv-generator/projects/${project.id}/export`)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100">
              <Download size={14} className="text-gray-400" /> Export Package
            </button>
            <hr className="border-gray-100" />
            <button onClick={() => { deleteProject(project.id); navigate('/kv-generator') }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
              <Trash2 size={14} /> Delete Project
            </button>
          </div>

          {/* Export history */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Export History</h3>
            {projectExports.length === 0 ? (
              <p className="text-xs text-gray-400">No exports yet</p>
            ) : (
              <div className="space-y-2">
                {projectExports.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{new Date(e.exportedAt).toLocaleDateString()}</span>
                    <span className="text-gray-400">{e.fileCount} files</span>
                    <a href={e.downloadUrl} className="text-cimb-red hover:underline flex items-center gap-1"><Download size={10} /> Re-download</a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share links */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Share Links ({projectLinks.length})</h3>

            {/* PRD RD-21: inline generate share link — no re-export required */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Generate new link</p>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-500 shrink-0">Expires in</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(Number(e.target.value))}
                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-cimb-red"
                >
                  {[3, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>
              {generatedToken ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                    <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                    <span className="text-xs font-mono text-green-700 truncate flex-1">{generatedToken}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/share/${generatedToken}`); }}
                      className="text-xs text-green-600 hover:text-green-800 shrink-0 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                  <button
                    onClick={() => setGeneratedToken(null)}
                    className="text-xs text-gray-400 hover:text-gray-600"
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
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-white bg-cimb-red rounded-lg hover:bg-red-800"
                >
                  <Link2 size={11} /> Generate & Copy Link
                </button>
              )}
            </div>

            {projectLinks.length === 0 ? (
              <p className="text-xs text-gray-400">No share links yet</p>
            ) : (
              <div className="space-y-2">
                {projectLinks.map((l) => {
                  const expired = new Date(l.expiresAt) < new Date()
                  return (
                    <div key={l.id} className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${l.isRevoked || expired ? 'bg-gray-300' : 'bg-green-400'}`} />
                        <span className={`font-mono truncate flex-1 ${l.isRevoked || expired ? 'text-gray-400' : 'text-gray-600'}`}>{l.token}</span>
                        {!l.isRevoked && !expired && (
                          <button
                            onClick={() => revokeShareLink(l.token)}
                            className="text-gray-300 hover:text-red-400 shrink-0"
                            title="Revoke link"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <div className="text-gray-400 mt-0.5 pl-3.5">
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
