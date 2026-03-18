import { Link, useLocation, Outlet } from 'react-router-dom'
import { Layers, LayoutDashboard, BookTemplate, ChevronRight, Check } from 'lucide-react'

function buildBreadcrumbs(pathname: string): { label: string; to?: string }[] {
  // Image Editor breadcrumbs
  if (pathname.startsWith('/image-editor')) {
    const crumbs: { label: string; to?: string }[] = [{ label: 'frndOS', to: '/' }, { label: 'Image Editor', to: '/image-editor' }]
    if (pathname.includes('/edit')) crumbs.push({ label: 'Canvas' })
    return crumbs
  }

  // KV Generator breadcrumbs
  const crumbs: { label: string; to?: string }[] = [{ label: 'frndOS', to: '/' }, { label: 'KV Generator', to: '/kv-generator' }]
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
    if (key === 'setup') return projectId ? null : '/kv-generator/new'
    if (key === 'generate') return projectId ? `/kv-generator/projects/${projectId}/generate` : '/kv-generator/new/generate'
    if (key === 'edit') return projectId ? `/kv-generator/projects/${projectId}/edit` : null
    if (key === 'export') return projectId ? `/kv-generator/projects/${projectId}/export` : null
    return null
  }

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-0">
      {KV_STEPS.map((step, idx) => {
        const isDone = idx < currentIdx
        const isActive = idx === currentIdx
        const isFuture = idx > currentIdx
        const href = isDone ? stepTo(step.key) : null

        const indicator = (
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
            isDone  ? 'bg-green-500 text-white' :
            isActive ? 'bg-cimb-red text-white' :
            'bg-gray-200 text-gray-400'
          }`}>
            {isDone ? <Check size={12} /> : idx + 1}
          </div>
        )

        return (
          <div key={step.key} className="flex items-center">
            {/* Step */}
            <div className={`flex items-center gap-2 px-2 py-1 rounded-lg transition-colors ${isDone && href ? 'cursor-pointer hover:bg-gray-50 group' : ''}`}>
              {isDone && href ? (
                <Link to={href} className="flex items-center gap-2">
                  {indicator}
                  <span className="text-xs font-medium text-green-600 group-hover:text-green-700 whitespace-nowrap">{step.label}</span>
                </Link>
              ) : (
                <>
                  {indicator}
                  <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-gray-900' : isFuture ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </>
              )}
            </div>
            {/* Connector */}
            {idx < KV_STEPS.length - 1 && (
              <div className={`w-10 h-px mx-1 ${idx < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function AppShell() {
  const { pathname } = useLocation()
  const crumbs = buildBreadcrumbs(pathname)

  const isKVActive = pathname.startsWith('/kv-generator') && !pathname.includes('/templates')
  const isTemplatesActive = pathname.includes('/templates')

  const isKVFlowStep = getKVStepKey(pathname) !== null

  return (
    <div className="min-h-screen bg-frnd-gray-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-frnd-dark text-white h-14 flex items-center px-6 gap-6 shrink-0 z-10">
        <div className="flex items-center gap-2 font-bold text-base">
          <Layers size={20} className="text-cimb-red" />
          <span>frndOS</span>
        </div>
        <nav className="flex items-center gap-1 ml-4">
          <Link to="/kv-generator" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${isKVActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
            <LayoutDashboard size={14} />
            KV Generator
          </Link>
          <Link to="/kv-generator/templates" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${isTemplatesActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
            <BookTemplate size={14} />
            Templates
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cimb-red flex items-center justify-center text-xs font-bold">BS</div>
        </div>
      </header>

      {/* KV Generator Stepper — shown during flow steps (Setup/Generate/Edit/Export) */}
      {isKVFlowStep && <KVStepper pathname={pathname} />}

      {/* Breadcrumb — shown when not in KV flow steps */}
      {!isKVFlowStep && (
        <div className="bg-white border-b border-gray-200 px-6 py-2 flex items-center gap-1 text-sm text-gray-500">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} className="text-gray-300" />}
              {c.to ? <Link to={c.to} className="hover:text-gray-900 transition-colors">{c.label}</Link> : <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : ''}>{c.label}</span>}
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
