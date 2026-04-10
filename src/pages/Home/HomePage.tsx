import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, LayoutDashboard, PenTool, Maximize2, ChevronRight,
  Beaker, FileText, Video, Layers2, PresentationIcon,
  Building2, FlaskConical, AlertCircle, ArrowRight,
  PlusCircle, Sparkles, Search, X, Check, CheckCircle2,
  ChevronLeft, RefreshCw,
} from 'lucide-react'

// ── Nav Modules (for Cmd+K) ─────────────────────────────────────────
const NAV_MODULES = [
  { label: 'Studio', icon: <Layers size={13} /> },
  { label: 'KV Generator', icon: <FileText size={13} /> },
  { label: 'Image Editor', icon: <PenTool size={13} /> },
  { label: 'Resizer', icon: <Maximize2 size={13} /> },
  { label: 'Brief Generator', icon: <FileText size={13} /> },
  { label: 'Visual Lab', icon: <Beaker size={13} /> },
  { label: 'Deck Creation', icon: <PresentationIcon size={13} /> },
  { label: 'Campaign Creator', icon: <Layers2 size={13} /> },
  { label: 'Video Creator', icon: <Video size={13} /> },
]

// ── Cmd+K Overlay ────────────────────────────────────────────────────
function CmdKOverlay({ open, onClose, initialQuery = '' }: { open: boolean; onClose: () => void; initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = query.trim().length === 0
    ? NAV_MODULES
    : NAV_MODULES.filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))

  const isNaturalLanguage = query.trim().split(' ').length >= 3 || (query.length > 0 && filtered.length === 0)
  const showChat = query.length > 0

  useEffect(() => { queueMicrotask(() => setActiveIndex(0)) }, [query])
  useEffect(() => { if (open) queueMicrotask(() => setQuery(initialQuery)) }, [open, initialQuery])

  useEffect(() => {
    if (!open) { setQuery(''); setActiveIndex(0); return }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { setActiveIndex((i) => Math.min(i + 1, filtered.length + (showChat ? 0 : -1))); e.preventDefault() }
      if (e.key === 'ArrowUp') { setActiveIndex((i) => Math.max(i - 1, 0)); e.preventDefault() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, filtered.length, showChat])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-[72px] px-4" onClick={onClose}>
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="border border-white/15 rounded-2xl bg-[#111] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Sparkles size={15} className="text-[#60a5fa] shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask frndOS or type a command..."
              className="flex-1 bg-transparent text-white/85 text-sm outline-none placeholder:text-white/25"
            />
            <kbd className="px-2 py-0.5 rounded bg-white/[0.06] text-white/20 text-[10px] font-mono">esc</kbd>
          </div>

          <div className="border-t border-white/[0.07]">
            {filtered.length > 0 && (
              <div>
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium px-4 pt-2.5 pb-1">Navigation</p>
                {filtered.map((mod, i) => (
                  <button
                    key={mod.label}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${activeIndex === i ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}
                  >
                    <span className={activeIndex === i ? 'text-white/60' : 'text-white/25'}>{mod.icon}</span>
                    <span className={`text-sm ${activeIndex === i ? 'text-white/85' : 'text-white/50'}`}>{mod.label}</span>
                    {activeIndex === i && (
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-white/20">
                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && query.trim().split(' ').length < 3 && (
              <p className="px-4 py-3 text-[11px] text-white/25">No results — try a module name or ask a question</p>
            )}

            {showChat && (
              <div className="border-t border-white/[0.06]">
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-medium px-4 pt-2.5 pb-1">Chat</p>
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left ${isNaturalLanguage ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'}`}
                >
                  <span className="text-[#60a5fa]"><Sparkles size={13} /></span>
                  <span className="text-sm text-white/50">
                    Ask FRnD: <span className="text-white/70">&ldquo;{query}&rdquo;</span>
                  </span>
                  {isNaturalLanguage && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-white/20">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono">↵</kbd>
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.05]">
            {[
              { key: '↑↓', label: 'navigate' },
              { key: '↵', label: 'select' },
              { key: 'esc', label: 'close' },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] font-mono text-white/25">{key}</kbd>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Inline mock projects — 10 items ──────────────────────────────────
const MOCK_PROJECTS = [
  { id: 'p1', name: 'Ramadan Promo 2026', lastEditedBy: 'u1', lastEditedByName: 'Budi Santoso', lastEditedAt: '2026-03-14T10:30:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop', tool: 'KV Generator', status: 'draft' },
  { id: 'p2', name: 'Hari Raya Sale', lastEditedBy: 'u2', lastEditedByName: 'Rina Kusuma', lastEditedAt: '2026-03-25T08:45:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop', tool: 'KV Generator', status: 'approved' },
  { id: 'p3', name: 'Premium Wealth Q2', lastEditedBy: 'u1', lastEditedByName: 'Budi Santoso', lastEditedAt: '2026-03-24T14:20:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=400&fit=crop', tool: 'Image Editor', status: 'draft' },
  { id: 'p4', name: 'Eid Gift KV', lastEditedBy: 'u3', lastEditedByName: 'Ayu Lestari', lastEditedAt: '2026-03-23T09:15:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop', tool: 'KV Generator', status: 'brief' },
  { id: 'p5', name: 'Mudik Campaign 2026', lastEditedBy: 'u4', lastEditedByName: 'Dimas Pratama', lastEditedAt: '2026-03-22T16:00:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=400&fit=crop', tool: 'KV Generator', status: 'draft' },
  { id: 'p6', name: 'SME Loan Q2 Push', lastEditedBy: 'u1', lastEditedByName: 'Budi Santoso', lastEditedAt: '2026-03-21T11:30:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop', tool: 'Image Editor', status: 'draft' },
  { id: 'p7', name: 'Flash Sale Weekend', lastEditedBy: 'u2', lastEditedByName: 'Rina Kusuma', lastEditedAt: '2026-03-20T14:00:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=400&fit=crop', tool: 'KV Generator', status: 'draft' },
  { id: 'p8', name: 'Wealth Max Campaign', lastEditedBy: 'u3', lastEditedByName: 'Ayu Lestari', lastEditedAt: '2026-03-19T10:00:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop', tool: 'Resizer', status: 'approved' },
  { id: 'p9', name: 'Sharia Savings Launch', lastEditedBy: 'u4', lastEditedByName: 'Dimas Pratama', lastEditedAt: '2026-03-18T09:00:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=400&h=400&fit=crop', tool: 'KV Generator', status: 'draft' },
  { id: 'p10', name: 'Digital Banking Promo', lastEditedBy: 'u1', lastEditedByName: 'Budi Santoso', lastEditedAt: '2026-03-17T15:45:00Z', thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop', tool: 'Image Editor', status: 'draft' },
]

// ── Tool Registry ─────────────────────────────────────────────────
type ToolStatus = 'live' | 'coming-soon'
type ToolCategory = 'Visual' | 'Brief & Strategy' | 'Video'

interface Tool {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  to: string
  status: ToolStatus
  category: ToolCategory
}

const TOOL_REGISTRY: Tool[] = [
  { id: 'kv-generator', label: 'KV Generator', description: 'Generate brand-safe key visuals from prompt, manage projects, export multi-format.', icon: <LayoutDashboard size={16} />, to: '/kv-generator', status: 'live', category: 'Visual' },
  { id: 'image-editor', label: 'Image Editor', description: 'Prompt-driven canvas editing with mask tools, text, erase, and asset overlay.', icon: <PenTool size={16} />, to: '/image-editor', status: 'live', category: 'Visual' },
  { id: 'resizer', label: 'Resizer', description: 'Resize approved assets to all standard ad platform dimensions automatically.', icon: <Maximize2 size={16} />, to: '/resizer', status: 'live', category: 'Visual' },
  { id: 'visual-lab', label: 'Visual Lab', description: 'Full-screen AI canvas for image and video creation with in-painting.', icon: <Beaker size={16} />, to: '#', status: 'coming-soon', category: 'Visual' },
  { id: 'brief-generator', label: 'Brief Generator', description: 'Multi-step strategic engine: Client Brief → Business Briefcase → Creative Brief → PPT.', icon: <FileText size={16} />, to: '#', status: 'coming-soon', category: 'Brief & Strategy' },
  { id: 'campaign-creator', label: 'Campaign Creator', description: 'End-to-end campaign asset production across formats and platforms.', icon: <Layers2 size={16} />, to: '#', status: 'coming-soon', category: 'Brief & Strategy' },
  { id: 'video-creator', label: 'Video Creator', description: 'AI-assisted storyboard generation and video asset creation.', icon: <Video size={16} />, to: '#', status: 'coming-soon', category: 'Video' },
  { id: 'deck-creation', label: 'Deck Creation', description: 'Generate presentation decks from brief content and brand templates.', icon: <PresentationIcon size={16} />, to: '#', status: 'coming-soon', category: 'Brief & Strategy' },
]

// ── Mock session ──────────────────────────────────────────────────
const SESSION = {
  firstName: 'Budi',
  initials: 'BS',
  role: 'Designer' as 'Designer' | 'Account Manager' | 'Strategist' | 'Manager',
  workspace: {
    type: 'brand' as 'brand' | 'playground',
    brandName: 'CIMB Niaga',
    brandProfileVersion: 'v3',
  },
}

// ── Mock Brand Identity for active brand (CIMB Niaga) ────────────
const ACTIVE_BRAND_IDENTITY = {
  primaryColor: '#C8102E',
  typographyH1: 'GT Walsheim',
  typographyBody: 'Inter',
  visualDos: ['Logo on bottom-right', 'Red as dominant color'],
  visualDonts: [],
}

// Guardrail checklist item shape
interface GuardrailItem {
  id: string
  label: string
  subLabel: string
  done: boolean
}

// ── Mock Team Activities ────────────────────────────────────────────
type ActivityType = 'generated' | 'exported' | 'saved' | 'started' | 'shared'

interface Activity {
  id: string
  who: string
  initials: string
  action: string
  project: string
  time: string
  type: ActivityType
  tool: string
  brand: string
}

const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', who: 'Rina Kusuma', initials: 'RK', action: 'generated 8 options', project: 'Hari Raya Sale', time: '12m ago', type: 'generated', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a2', who: 'Budi Santoso', initials: 'BS', action: 'exported ZIP', project: 'Ramadan Promo 2026', time: '34m ago', type: 'exported', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a3', who: 'Ayu Lestari', initials: 'AL', action: 'saved as template', project: 'Premium Wealth Q2', time: '1h ago', type: 'saved', tool: 'Brief Generator', brand: 'CIMB Niaga' },
  { id: 'a4', who: 'Rina Kusuma', initials: 'RK', action: 'started new project', project: 'Eid Gift KV', time: '2h ago', type: 'started', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a5', who: 'Dimas Pratama', initials: 'DP', action: 'shared link', project: 'Ramadan Promo 2026', time: '3h ago', type: 'shared', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a6', who: 'Budi Santoso', initials: 'BS', action: 'generated 12 options', project: 'Premium Wealth Q2', time: '5h ago', type: 'generated', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a7', who: 'Ayu Lestari', initials: 'AL', action: 'exported PNG', project: 'Hari Raya Sale', time: 'yesterday', type: 'exported', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a8', who: 'Dimas Pratama', initials: 'DP', action: 'saved as template', project: 'Ramadan Promo 2026', time: 'yesterday', type: 'saved', tool: 'Brief Generator', brand: 'CIMB Niaga' },
  { id: 'a9', who: 'Rina Kusuma', initials: 'RK', action: 'generated 5 options', project: 'Eid Gift KV', time: '2d ago', type: 'generated', tool: 'KV Generator', brand: 'CIMB Niaga' },
  { id: 'a10', who: 'Budi Santoso', initials: 'BS', action: 'started new project', project: 'Ramadan Promo 2026', time: '3d ago', type: 'started', tool: 'KV Generator', brand: 'CIMB Niaga' },
]

// Avatar color from initials hash
function avatarColor(initials: string): string {
  const colors = [
    'bg-blue-500/30 text-blue-300',
    'bg-purple-500/30 text-purple-300',
    'bg-green-500/30 text-green-300',
    'bg-amber-500/30 text-amber-300',
    'bg-pink-500/30 text-pink-300',
    'bg-teal-500/30 text-teal-300',
    'bg-orange-500/30 text-orange-300',
    'bg-indigo-500/30 text-indigo-300',
  ]
  let hash = 0
  for (const c of initials) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}


// ── Suggested Actions Mock ─────────────────────────────────────────
type SuggestionAction = 'resume' | 'export' | 'start'

interface Suggestion {
  id: string
  title: string
  description: string
  shortcut: string
  action: SuggestionAction
  projectName?: string
  accentColor: string  // CSS class for left border
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    title: 'Resume Ramadan Promo 2026',
    description: 'You have unsaved changes in KV Generator.',
    shortcut: '⌘S',
    action: 'resume',
    projectName: 'Ramadan Promo 2026',
    accentColor: 'border-l-amber-400',
  },
  {
    id: 's2',
    title: 'Export Hari Raya Sale',
    description: 'Approved — ready to export in 5 formats.',
    shortcut: '⌘E',
    action: 'export',
    projectName: 'Hari Raya Sale',
    accentColor: 'border-l-green-400',
  },
  {
    id: 's3',
    title: 'Generate options for Eid Gift KV',
    description: 'Brief Generator created a new brief for this project.',
    shortcut: '↵',
    action: 'start',
    projectName: 'Eid Gift KV',
    accentColor: 'border-l-blue-400',
  },
]

// ── Helpers ────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getRoleSubtitle(role: typeof SESSION.role, brandName: string): string {
  switch (role) {
    case 'Designer': return 'What would you like to create today?'
    case 'Account Manager': return 'Which production tool do you need?'
    case 'Strategist': return 'Review in-progress Studio projects below.'
    case 'Manager': return `Studio overview for ${brandName}.`
  }
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'yesterday'
  return `${days}d ago`
}


// ── Workspace Context ──────────────────────────────────────────────
function WorkspaceContext() {
  const { workspace } = SESSION

  if (workspace.type === 'playground') {
    return (
      <div className="flex items-center gap-2 text-xs text-white/30">
        <FlaskConical size={11} />
        <span>Playground</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-white/40">
      <Building2 size={11} className="text-white/25" />
      <span className="text-white/60">{workspace.brandName}</span>
      <span className="text-white/15">·</span>
      <span className="text-white/25">Profile {workspace.brandProfileVersion}</span>
    </div>
  )
}

// ── Brand Guardrail Checklist ─────────────────────────────────────
// Focused single-brand view replacing the old warning banner.
function BrandGuardrailChecklist() {
  const { workspace } = SESSION
  const identity = ACTIVE_BRAND_IDENTITY

  if (workspace.type === 'playground') return null

  const items: GuardrailItem[] = [
    {
      id: 'primaryColor',
      label: 'Primary Color',
      subLabel: identity.primaryColor ? identity.primaryColor : 'Not set',
      done: !!identity.primaryColor,
    },
    {
      id: 'typographyH1',
      label: 'Typography H1',
      subLabel: identity.typographyH1 ?? 'Not set',
      done: !!identity.typographyH1,
    },
    {
      id: 'typographyBody',
      label: 'Typography Body',
      subLabel: identity.typographyBody ?? 'Not set',
      done: !!identity.typographyBody,
    },
    {
      id: 'visualDos',
      label: "Visual Do's",
      subLabel: identity.visualDos.length > 0 ? `${identity.visualDos.length} rule(s) added` : 'None added',
      done: identity.visualDos.length > 0,
    },
    {
      id: 'visualDonts',
      label: "Visual Don'ts",
      subLabel: identity.visualDonts.length > 0 ? `${identity.visualDonts.length} rule(s) added` : 'None added',
      done: identity.visualDonts.length > 0,
    },
  ]

  const doneCount = items.filter((i) => i.done).length
  const allDone = doneCount === items.length
  const progressPct = (doneCount / items.length) * 100

  if (allDone) {
    return (
      <div className="flex items-center gap-3 mb-10 px-4 py-3 border border-green-500/20 bg-green-500/5">
        <CheckCircle2 size={14} className="text-green-400/70 shrink-0" />
        <div>
          <p className="text-white/70 text-xs font-medium">
            Brand guardrails complete for <span className="text-white/90">{workspace.brandName}</span>
          </p>
          <p className="text-white/30 text-[11px] mt-0.5">All guardrail items configured — ready to generate.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-10 border border-white/10 bg-white/[0.02] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Building2 size={13} className="text-white/30" />
          <span className="text-white/70 text-xs font-semibold">{workspace.brandName} Guardrails</span>
          <span className="text-white/20 text-[11px]">· Profile {workspace.brandProfileVersion}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-white/30 text-[11px]">{doneCount}/{items.length}</span>
            <div className="w-16 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400/60 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-colors ${
              item.done
                ? 'border-white/[0.08] bg-white/[0.02]'
                : 'border-amber-500/20 bg-amber-500/5'
            }`}
          >
            <div className={`shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${
              item.done ? 'bg-green-500/20 border-green-500/30' : 'border-amber-500/30 bg-transparent'
            }`}>
              {item.done && <Check size={9} className="text-green-400" />}
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-medium ${item.done ? 'text-white/50' : 'text-white/70'}`}>
                {item.label}
              </p>
              <p className={`text-[11px] mt-0.5 ${item.done ? 'text-white/25' : 'text-amber-400/60'}`}>
                {item.subLabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Continue Working — 10 projects with dots + CTA ────────────────
// Text-first. Shows 5 expanded + 6-10 as dot indicators.
// CTA below opens ProjectGalleryModal.
function ContinueWorkingCard({ onOpenGallery }: { onOpenGallery: () => void }) {
  const navigate = useNavigate()
  const { role } = SESSION
  const currentUserId = 'u1'
  const [activeIndex, setActiveIndex] = useState(0)

  const isWorkspaceWide = role === 'Account Manager' || role === 'Manager'

  const recentProjects = [...MOCK_PROJECTS]
    .sort((a, b) => new Date(b.lastEditedAt).getTime() - new Date(a.lastEditedAt).getTime())

  const visibleProjects = recentProjects.slice(0, 5)
  const extraProjects = recentProjects.slice(5, 10)

  return (
    <div className="mb-10">
      <p className="text-white/20 text-[11px] uppercase tracking-widest font-medium mb-3">
        {isWorkspaceWide ? 'Recent in workspace' : 'Continue working'}
      </p>

      {/* Empty state */}
      {recentProjects.length === 0 ? (
        <div className="flex flex-col items-start gap-3 py-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <Sparkles size={12} className="text-white/20" />
            </div>
            <p className="text-white/30 text-xs">No recent work yet</p>
          </div>
          <p className="text-white/20 text-[11px] leading-relaxed">
            Start your first project and it will appear here for quick access.
          </p>
          <button
            onClick={() => navigate('/kv-generator/new')}
            className="flex items-center gap-1.5 mt-1 text-white/40 hover:text-white/70 text-xs transition-colors group"
          >
            <PlusCircle size={13} className="text-white/30 group-hover:text-white/50 transition-colors" />
            <span>Create a KV project</span>
            <ArrowRight size={10} className="text-white/0 group-hover:text-white/40 transition-colors" />
          </button>
        </div>
      ) : (
        <>
          {/* Project list — full width */}
          <div className="flex flex-col">
            {visibleProjects.map((project, i) => {
              const isActive = i === activeIndex
              const toolPath = project.tool === 'KV Generator'
                ? `/kv-generator/projects/${project.id}`
                : project.tool === 'Image Editor'
                ? `/image-editor`
                : `/resizer`
              const isOwnWork = project.lastEditedBy === currentUserId

              return (
                <button
                  key={project.id}
                  onClick={() => isActive ? navigate(toolPath) : setActiveIndex(i)}
                  className={`group w-full flex items-center gap-4 text-left transition-all duration-200 ${
                    i < visibleProjects.length - 1 ? 'border-b border-white/[0.04]' : ''
                  } ${isActive ? 'py-4' : 'py-3'}`}
                >
                  {/* Index */}
                  <span
                    className="font-mono shrink-0 transition-all duration-200 select-none"
                    style={{
                      fontSize: isActive ? 20 : 10,
                      color: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                      width: 30,
                      textAlign: 'right',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Thumbnail */}
                  <div
                    className="shrink-0 overflow-hidden bg-white/5 transition-all duration-200"
                    style={{
                      width: isActive ? 60 : 28,
                      height: isActive ? 60 : 28,
                      borderRadius: isActive ? 8 : 6,
                      opacity: isActive ? 1 : 0.35,
                    }}
                  >
                    {project.thumbnailUrl && (
                      <img src={project.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium truncate transition-all duration-200"
                      style={{
                        fontSize: isActive ? 17 : 14,
                        color: isActive ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.25)',
                      }}
                    >
                      {project.name}
                    </p>
                    <div
                      className="overflow-hidden transition-all duration-200"
                      style={{ maxHeight: isActive ? 24 : 0, opacity: isActive ? 1 : 0 }}
                    >
                      <p className="text-white/25 text-[11px] mt-0.5 truncate">
                        {project.tool} · {isOwnWork
                          ? formatRelativeTime(project.lastEditedAt)
                          : `${project.lastEditedByName} · ${formatRelativeTime(project.lastEditedAt)}`
                        }
                      </p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className="shrink-0 flex items-center gap-1 transition-all duration-150"
                    style={{ opacity: isActive ? undefined : 0 }}
                  >
                    <span className="text-[11px] text-white/0 group-hover:text-white/40 transition-colors duration-150">
                      {isOwnWork ? 'Continue' : 'Open'}
                    </span>
                    <ArrowRight size={14} className="text-white/0 group-hover:text-white/40 transition-colors duration-150" />
                  </div>
                </button>
              )
            })}

            {/* Extra project dots (6-10) */}
            {extraProjects.length > 0 && (
              <div className="flex items-center gap-3 pt-3 pb-1 w-full">
                <div className="flex items-center gap-1.5 flex-1 justify-center">
                  {extraProjects.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveIndex(5 + i)}
                      className="w-2 h-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                      title={p.name}
                    />
                  ))}
                </div>
                <button
                  onClick={onOpenGallery}
                  className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 transition-colors shrink-0"
                >
                  View all {MOCK_PROJECTS.length}
                  <ArrowRight size={9} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Project Gallery Modal ──────────────────────────────────────────
// Cinematic full-screen viewer: sidebar project list + hero preview panel.
function ProjectGalleryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)

  const PAGE_SIZE = 12

  useEffect(() => {
    if (!open) { queueMicrotask(() => { setSearch(''); setSelectedIdx(0) }); return }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const allFiltered = MOCK_PROJECTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE))
  const currentPage = Math.min(totalPages, Math.ceil((selectedIdx + 1) / PAGE_SIZE))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pageItems = allFiltered.slice(pageStart, pageStart + PAGE_SIZE)

  // Clamp selectedIdx to valid range when filter changes
  const safeSelectedIdx = Math.min(selectedIdx, allFiltered.length - 1)
  const selected = allFiltered[safeSelectedIdx] ?? null

  // Status label
  const statusLabel = {
    draft: 'DRAFT',
    approved: 'APPROVED',
    brief: 'BRIEF READY',
  } as Record<string, string>

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 md:p-12 lg:p-24">
        {/* Modal */}
        <div
          className="w-full max-w-[1600px] h-full max-h-[900px] bg-[#0e0e0e] shadow-[0px_0px_120px_20px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden rounded-sm flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Close Button ── */}
          <button
            onClick={onClose}
            className="absolute top-6 right-8 z-[70] text-white/30 hover:text-white/70 hover:scale-110 transition-all duration-300 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full p-2"
          >
            <X size={28} strokeWidth={1.5} />
          </button>

          {/* ── Sidebar ── */}
          <aside className="w-full md:w-[380px] lg:w-[400px] flex flex-col border-r border-white/5 bg-[#0e0e0e] h-full shrink-0">
            {/* Header */}
            <div className="p-8 pb-4 shrink-0">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-white/90">Projects Library</h1>
              <p className="text-white/30 text-[10px] mt-1 uppercase tracking-[0.2em] font-bold">
                {allFiltered.length} TOTAL ASSETS
              </p>
              {/* Search */}
              <div className="relative mt-6 group">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white/50 transition-colors shrink-0"
                />
                <input
                  autoFocus={open}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0) }}
                  placeholder="Search archive..."
                  className="bg-[#191a1a] border border-white/5 focus:border-white/20 text-xs py-3 pl-10 pr-4 w-full transition-all outline-none placeholder:text-white/20 text-white/70"
                />
              </div>
            </div>

            {/* Project list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
              {pageItems.map((project, i) => {
                const isActive = allFiltered.indexOf(project) === safeSelectedIdx
                const globalIdx = pageStart + i
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedIdx(globalIdx)}
                    className={`w-full text-left px-8 py-4 border-l-2 transition-all duration-200 group ${
                      isActive
                        ? 'custom-active-bg border-tertiary cursor-pointer'
                        : 'border-transparent hover:bg-[#1f2020]/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-bold tracking-tight transition-colors ${
                        isActive ? 'text-[#bbffb3]' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {project.name}
                      </h3>
                      {isActive && (
                        <span className="text-[8px] text-[#bbffb3]/70 font-mono tracking-widest">SELECTED</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                      {formatRelativeTime(project.lastEditedAt)}
                      <span className="mx-1 opacity-40">·</span>
                      {project.tool}
                    </p>
                  </button>
                )
              })}

              {allFiltered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                  <Search size={20} className="text-white/10 mb-3" />
                  <p className="text-white/25 text-xs">No projects match &ldquo;{search}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="px-8 py-4 bg-[#131313] border-t border-white/5 flex justify-between items-center shrink-0">
              <span className="text-[9px] text-white/30 font-bold tracking-widest uppercase">
                Page {currentPage} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedIdx(Math.max(0, safeSelectedIdx - 1))}
                  disabled={safeSelectedIdx === 0}
                  className="p-1.5 hover:text-white/70 text-white/30 disabled:opacity-20 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setSelectedIdx(Math.min(allFiltered.length - 1, safeSelectedIdx + 1))}
                  disabled={safeSelectedIdx === allFiltered.length - 1}
                  className="p-1.5 hover:text-white/70 text-white/30 disabled:opacity-20 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Preview ── */}
          <main className="flex-1 flex flex-col relative bg-[#0e0e0e] overflow-hidden">
            {selected ? (
              <>
                {/* Hero image */}
                <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative overflow-hidden min-h-0">
                  {/* Subtle gradient glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#bbffb3]/5 to-transparent pointer-events-none" />

                  <div className="w-full max-w-[1000px] max-h-[65vh] relative overflow-hidden group flex items-center justify-center">
                    {selected.thumbnailUrl && (
                      <img
                        src={selected.thumbnailUrl}
                        alt={selected.name}
                        className="max-w-full max-h-full object-contain opacity-95"
                      />
                    )}
                  </div>
                </div>

                {/* Project info */}
                <div className="px-12 pb-12 pt-0 flex flex-col md:flex-row justify-between gap-8 z-10 items-start">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white/90 tracking-tight mb-6">
                      {selected.name}
                      <span className="ml-4 text-[10px] px-2 py-0.5 border border-[#bbffb3]/30 text-[#bbffb3] font-bold tracking-widest uppercase align-middle">
                        {selected.tool}
                      </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/30 tracking-wider uppercase opacity-80">
                          Created by: <span className="text-white/70 font-semibold">{selected.lastEditedByName}</span>
                        </p>
                        <p className="text-[10px] text-white/30 tracking-wider uppercase opacity-80">
                          Last modified: <span className="text-white/70 font-semibold">{formatRelativeTime(selected.lastEditedAt)}</span>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-white/30 tracking-wider uppercase opacity-80">
                          Status:{' '}
                          <span className={`font-bold px-1.5 py-0.5 rounded-sm ${
                            selected.status === 'approved'
                              ? 'text-[#bbffb3] bg-[#bbffb3]/10'
                              : selected.status === 'brief'
                              ? 'text-blue-400 bg-blue-400/10'
                              : 'text-white/50 bg-white/5'
                          }`}>
                            {statusLabel[selected.status]}
                          </span>
                        </p>
                        <p className="text-[10px] text-white/30 tracking-wider uppercase opacity-80">
                          Tool: <span className="text-white/70 font-semibold">{selected.tool}</span>
                        </p>
                      </div>
                    </div>

                    {/* Open button */}
                    <button
                      onClick={() => {
                        const toolPath = selected.tool === 'KV Generator'
                          ? `/kv-generator/projects/${selected.id}`
                          : selected.tool === 'Image Editor'
                          ? `/image-editor`
                          : `/resizer`
                        navigate(toolPath)
                        onClose()
                      }}
                      className="mt-6 flex items-center gap-2 px-5 py-2.5 border border-white/15 hover:border-white/30 text-white/60 hover:text-white/90 text-xs font-medium transition-all rounded-lg bg-white/5 hover:bg-white/10"
                    >
                      Open Project <ArrowRight size={12} />
                    </button>
                  </div>
                </div>

                {/* Watermark */}
                <div className="absolute bottom-6 right-8 opacity-10 pointer-events-none select-none">
                  <span className="text-5xl font-bold tracking-tighter leading-none text-white/30">
                    frndOS
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/20 text-sm">Select a project to preview</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

// ── Suggested Actions ─────────────────────────────────────────────
// AI suggestions — col-span-7 layout per wireframe
function SuggestedActions() {
  const navigate = useNavigate()

  const handleAction = (s: Suggestion) => {
    if (s.action === 'resume') navigate(`/kv-generator/projects/p1`)
    else if (s.action === 'export') navigate(`/kv-generator/projects/p2/export`)
    else if (s.action === 'start') navigate(`/kv-generator/projects/p4`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-white/30" />
          <h3 className="text-white text-xl font-bold tracking-tight">
            AI Suggestions
          </h3>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/25 hover:text-white/60 transition-colors">
          <RefreshCw size={12} />
          Regenerate
        </button>
      </div>

      {/* Cards — vertical stack */}
      <div className="flex flex-col gap-3">
        {MOCK_SUGGESTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleAction(s)}
            className="group flex items-center gap-4 p-4 rounded-xl border border-white/[0.05] bg-[#1c1b1b] hover:bg-[#232323] border-l border-white/[0.05] transition-all duration-300 text-left"
          >
            {/* Thumbnail placeholder */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <div className="w-full h-full bg-[#2a2a2a] flex items-center justify-center">
                <Sparkles size={18} className="text-white/20" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Recommended Activity</span>
              </div>
              <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-white transition-colors">{s.title}</h4>
              <p className="text-xs text-white/35 truncate mt-0.5">{s.description}</p>
            </div>

            {/* Arrow */}
            <ChevronRight size={18} className="text-white/20 group-hover:text-white/70 group-hover:translate-x-1 transition-all shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Team Activity ─────────────────────────────────────────────────
// Timeline-style activity feed — col-span-5 per wireframe layout
function TeamActivity() {
  return (
    <div className="rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold tracking-tight text-white">
          Activity
        </h3>
      </div>

      <div className="space-y-4 relative">
        {/* Timeline vertical line */}
        <div className="absolute left-[14px] top-0 bottom-0 w-[1px] bg-white/[0.06]" />

        {MOCK_ACTIVITIES.slice(0, 7).map((activity) => (
          <div key={activity.id} className="relative flex gap-4">
            {/* Avatar */}
            <div className="relative z-10 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${avatarColor(activity.initials)}`}>
                {activity.initials}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 border-b border-white/[0.04] pb-3">
              <div className="flex justify-between items-start mb-1">
                <p className="text-xs font-semibold text-white tracking-tight">{activity.who}</p>
                <span className="text-[10px] text-white/25 font-medium shrink-0">{activity.time}</span>
              </div>
              <p className="text-[11px] text-white/35 leading-relaxed mb-1.5">
                <span>{activity.action}</span>
                {' — '}
                <span className="text-white/50">{activity.project}</span>
              </p>
              {/* Tool + brand pills */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 border border-white/[0.06]">
                  {activity.tool}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 border border-white/[0.06]">
                  {activity.brand}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tool Tile ─────────────────────────────────────────────────────
function ToolTile({ tool }: { tool: Tool }) {
  const navigate = useNavigate()
  const [showTooltip, setShowTooltip] = useState(false)
  const isLive = tool.status === 'live'

  return (
    <div className="relative">
      <button
        onClick={() => isLive && navigate(tool.to)}
        onMouseEnter={() => !isLive && setShowTooltip(true)}
        onMouseLeave={() => !isLive && setShowTooltip(false)}
        disabled={!isLive}
        className={`group w-full relative border border-white/[0.07] rounded-xl p-4 text-left transition-all duration-200 ${
          isLive
            ? 'bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/15 cursor-pointer'
            : 'bg-transparent opacity-30 cursor-not-allowed'
        }`}
      >
        {/* Icon */}
        <div className="w-7 h-7 rounded-md bg-white/5 flex items-center justify-center text-white/50 mb-3 group-hover:text-white/80 transition-colors">
          {tool.icon}
        </div>

        {/* Label */}
        <p className="text-white/80 text-xs font-semibold mb-1 leading-snug">{tool.label}</p>
        <p className="text-white/25 text-[11px] leading-relaxed line-clamp-2">{tool.description}</p>

        {/* Footer */}
        {isLive && (
          <div className="flex items-center gap-0.5 mt-3 text-[11px] text-white/20 group-hover:text-white/40 transition-colors">
            <span>Open</span>
            <ChevronRight size={10} />
          </div>
        )}
      </button>

      {showTooltip && !isLive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-[#111] text-white/50 text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none border border-white/10">
          Coming soon
        </div>
      )}
    </div>
  )
}

// ── Category Filter ───────────────────────────────────────────────
const CATEGORIES: ('All' | ToolCategory)[] = ['All', 'Visual', 'Brief & Strategy', 'Video']

// ── Main Page ─────────────────────────────────────────────────────
export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<'All' | ToolCategory>('All')
  const [cmdOpen, setCmdOpen] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)

  const filteredTools = activeFilter === 'All'
    ? TOOL_REGISTRY
    : TOOL_REGISTRY.filter((t) => t.category === activeFilter)

  const filteredLive = filteredTools.filter((t) => t.status === 'live')
  const filteredComingSoon = filteredTools.filter((t) => t.status === 'coming-soon')

  // Global Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#161616] flex flex-col">

      {/* Cmd+K overlay */}
      <CmdKOverlay
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
      />

      {/* Project gallery modal */}
      <ProjectGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-white/40" />
          <span className="text-white/70 font-semibold text-sm tracking-tight">frndOS</span>
          <span className="text-white/15 mx-1 text-xs">·</span>
          <span className="text-white/30 text-sm">Studio</span>
        </div>
        <div className="flex items-center gap-4">
          <WorkspaceContext />
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
            {SESSION.initials}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-12 max-w-7xl mx-auto w-full">

        {/* Greeting */}
        <div className="mb-6">
          <p className="text-white/25 text-sm mb-1">{getGreeting()}, {SESSION.firstName}</p>
          <h1 className="text-white/80 text-2xl font-semibold tracking-tight">
            {getRoleSubtitle(SESSION.role, SESSION.workspace.brandName)}
          </h1>
        </div>

        {/* Cmd+K trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2.5 border border-white/[0.07] rounded-xl text-xs text-white/30 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all mb-10"
        >
          <Search size={13} className="text-white/20 shrink-0" />
          <span>Ask frndOS or type a command...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded bg-white/[0.06] text-white/25 text-[10px] font-mono">⌘K</kbd>
        </button>

        {/* Brand Guardrail Checklist */}
        <BrandGuardrailChecklist />

        {/* Continue Working */}
        <ContinueWorkingCard onOpenGallery={() => setGalleryOpen(true)} />

        {/* Two-column grid: AI Suggestions (col 7) + Activity (col 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-12">

          {/* Col 7 — AI Suggestions */}
          <div className="lg:col-span-7">
            <SuggestedActions />
          </div>

          {/* Col 5 — Team Activity */}
          <div className="lg:col-span-5">
            <TeamActivity />
          </div>
        </div>

        {/* Section label + filter */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/25 text-xs uppercase tracking-widest font-medium">Tools</p>
          <div className="flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  activeFilter === cat
                    ? 'border-[#343434] bg-[#1f1f1f] text-[#e8e8e8]'
                    : 'border-[#262626] bg-transparent text-white/35 hover:border-[#343434] hover:text-white/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Live tools */}
        {filteredLive.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredLive.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
            </div>
          </div>
        )}

        {/* Divider between live / coming soon */}
        {filteredLive.length > 0 && filteredComingSoon.length > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/15 text-[11px] uppercase tracking-widest">Coming soon</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        )}

        {/* Coming soon */}
        {filteredComingSoon.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredComingSoon.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
          </div>
        )}

        {/* No results */}
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={20} className="text-white/10 mb-3" />
            <p className="text-white/20 text-xs">No tools in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
