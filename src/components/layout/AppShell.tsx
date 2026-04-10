import { Link, useLocation, Outlet } from 'react-router-dom'
import { Layers, ChevronRight, Check, PenTool, Maximize2 } from 'lucide-react'

// ── Tool metadata ─────────────────────────────────────────────
type Tool = {
  key: 'kv-generator' | 'image-editor' | 'resizer'
  label: string
  icon: React.ReactNode
  href: string
}

const TOOLS: Tool[] = [
  { key: 'kv-generator', label: 'KV Generator', icon: <Layers size={14} />,    href: '/kv-generator' },
  { key: 'image-editor',  label: 'Image Editor', icon: <PenTool size={14} />,   href: '/image-editor' },
  { key: 'resizer',       label: 'Resizer',       icon: <Maximize2 size={14} />, href: '/resizer' },
]

function getToolForPath(pathname: string): Tool {
  if (pathname.startsWith('/image-editor')) return TOOLS[1]
  if (pathname.startsWith('/resizer'))      return TOOLS[2]
  return TOOLS[0]
}

// ── Breadcrumbs ────────────────────────────────────────────────

function buildBreadcrumbs(pathname: string): { label: string; to?: string }[] {
  // Image Editor breadcrumbs
  if (pathname.startsWith('/image-editor')) {
    const crumbs: { label: string; to?: string }[] = [
      { label: 'frndOS', to: '/' },
      { label: 'Image Editor', to: '/image-editor' },
    ]
    if (pathname.includes('/edit')) crumbs.push({ label: 'Canvas' })
    return crumbs
  }

  // Resizer breadcrumbs
  if (pathname.startsWith('/resizer')) {
    const crumbs: { label: string; to?: string }[] = [
      { label: 'frndOS', to: '/' },
      { label: 'Resizer', to: '/resizer' },
    ]
    if (pathname.includes('/new')) crumbs.push({ label: 'New Project' })
    else if (pathname.includes('/projects/')) crumbs.push({ label: 'Resize Session' })
    return crumbs
  }

  // KV Generator breadcrumbs
  const crumbs: { label: string; to?: string }[] = [
    { label: 'Tools', to: '/' },
    { label: 'KV Generator', to: '/kv-generator' },
  ]
  if (pathname.includes('/new')) crumbs.push({ label: 'New Project' })
  else if (pathname.includes('/generate')) crumbs.push({ label: 'Generate' })
  else if (pathname.includes('/edit')) crumbs.push({ label: 'Image Editor' })
  else if (pathname.includes('/export')) crumbs.push({ label: 'Export' })
  else if (pathname.includes('/templates')) {
    crumbs.push({ label: 'Templates', to: '/kv-generator/templates' })
    if (pathname.includes('/setup')) crumbs.push({ label: 'Setup' })
  } else if (pathname.includes('/projects/')) crumbs.push({ label: 'Project Detail' })
  return crumbs
}

// ── KV Generator Stepper ──────────────────────────────────────────
// Steps shown during the KV creation flow: new project or existing project edit flow.
// Each completed step is clickable to navigate back.

type KVStep = { label: string; key: string }

const KV_STEPS: KVStep[] = [
  { key: 'setup',    label: 'Context Setup' },
  { key: 'generate', label: 'Generate' },
  { key: 'edit',     label: 'Edit' },
  { key: 'export',   label: 'Export' },
]

function getKVStepKey(pathname: string): string | null {
  if (pathname.includes('/new') && !pathname.includes('/generate')) return 'setup'
  if (pathname.includes('/generate')) return 'generate'
  if (pathname.includes('/edit')) return 'edit'
  if (pathname.includes('/export')) return 'export'
  return null
}

function extractProjectId(pathname: string): string | null {
  const match = pathname.match(/\/projects\/([^/]+)/)
  return match ? match[1] : null
}

function KVStepper({ pathname }: { pathname: string }) {
  const currentKey = getKVStepKey(pathname)
  if (!currentKey) return null

  const projectId = extractProjectId(pathname)
  const currentIdx = KV_STEPS.findIndex((s) => s.key === currentKey)

  function stepTo(key: string): string | null {
    if (key === 'setup')    return projectId ? null : '/kv-generator/new'
    if (key === 'generate') return projectId ? `/kv-generator/projects/${projectId}/generate` : '/kv-generator/new/generate'
    if (key === 'edit')     return projectId ? `/kv-generator/projects/${projectId}/edit` : null
    if (key === 'export')   return projectId ? `/kv-generator/projects/${projectId}/export` : null
    return null
  }

  return (
    <div className="bg-frnd-dark border-b border-white/5 px-6 py-3 flex items-center gap-0">
      {KV_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx
        const isActive = idx === currentIdx
        const isFuture = idx > currentIdx
        const href = isDone ? stepTo(step.key) : null

        const indicator = (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
            isDone  ? 'bg-white/20 text-white' :
            isActive ? 'bg-cimb-red text-white' :
            'bg-white/5 text-gray-500'
          }`}>
            {isDone ? <Check size={12} /> : idx + 1}
          </div>
        )

        return (
          <div key={step.key} className="flex items-center">
            {/* Step */}
            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${isDone && href ? 'cursor-pointer hover:bg-white/5 group' : ''}`}>
              {isDone && href ? (
                <Link to={href} className="flex items-center gap-2">
                  {indicator}
                  <span className="text-xs font-medium text-gray-400 group-hover:text-white whitespace-nowrap">{step.label}</span>
                </Link>
              ) : (
                <>
                  {indicator}
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-white' : isFuture ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                </>
              )}
            </div>
            {/* Connector */}
            {idx < KV_STEPS.length - 1 && (
              <div className={`w-10 h-px mx-1 ${idx < currentIdx ? 'bg-white/20' : 'bg-white/5'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Tool Badge ─────────────────────────────────────────────────
// Shows the active tool name in the header (e.g. "KV Generator · Image Editor")

function ToolBadge({ pathname }: { pathname: string }) {
  const tool = getToolForPath(pathname)
  return (
    <span className="text-gray-500 text-sm font-normal">
      <span className="text-white/20 mx-1">·</span>
      {tool.label}
    </span>
  )
}

// ── AppShell ───────────────────────────────────────────────────

export function AppShell() {
  const { pathname } = useLocation()
  const crumbs = buildBreadcrumbs(pathname)

  // Show stepper only for generate/edit/export steps
  const kvStepKey = getKVStepKey(pathname)
  const isKVFlowStep = kvStepKey !== null && kvStepKey !== 'setup'

  return (
    <div className="min-h-screen bg-frnd-dark flex flex-col">
      {/* Top Nav */}
      <header className="bg-frnd-dark text-white h-14 flex items-center px-6 gap-6 shrink-0 z-10 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold text-base">
          <Layers size={20} className="text-cimb-red" />
          <span>frndOS</span>
          <ToolBadge pathname={pathname} />
        </div>

        <nav className="flex items-center gap-1 ml-6">
          {TOOLS.map((tool) => {
            const isActive = pathname.startsWith(tool.href)
            return (
              <Link
                key={tool.key}
                to={tool.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tool.icon}
                {tool.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cimb-red flex items-center justify-center text-xs font-bold">BS</div>
        </div>
      </header>

      {/* KV Generator Stepper — shown during flow steps (Generate/Edit/Export) */}
      {isKVFlowStep && <KVStepper pathname={pathname} />}

      {/* Breadcrumb — shown when not in KV flow steps */}
      {!isKVFlowStep && (
        <div className="bg-frnd-dark border-b border-white/5 px-6 py-3 flex items-center gap-1 text-sm">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-white/20" />}
              {c.to
                ? <Link to={c.to} className="text-gray-500 hover:text-white transition-colors">{c.label}</Link>
                : <span className={i === crumbs.length - 1 ? 'text-white font-medium' : 'text-gray-500'}>{c.label}</span>
              }
            </span>
          ))}
        </div>
      )}

      {/* Page Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}