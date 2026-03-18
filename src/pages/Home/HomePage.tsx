import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, LayoutDashboard, PenTool, Maximize2, ChevronRight,
  Beaker, FileText, Video, Layers2, PresentationIcon, Lock,
  Building2, FlaskConical, AlertCircle,
} from 'lucide-react'

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
  // Live tools first
  {
    id: 'kv-generator',
    label: 'KV Generator',
    description: 'Generate brand-safe key visuals from prompt, manage projects, export multi-format.',
    icon: <LayoutDashboard size={18} className="text-white" />,
    to: '/kv-generator',
    status: 'live',
    category: 'Visual',
  },
  {
    id: 'image-editor',
    label: 'Image Editor',
    description: 'Prompt-driven canvas editing with mask tools, text, erase, and asset overlay.',
    icon: <PenTool size={18} className="text-white" />,
    to: '/image-editor',
    status: 'live',
    category: 'Visual',
  },
  // Coming Soon tools
  {
    id: 'visual-lab',
    label: 'Visual Lab',
    description: 'Full-screen AI canvas for image and video creation with in-painting.',
    icon: <Beaker size={18} className="text-white" />,
    to: '#',
    status: 'coming-soon',
    category: 'Visual',
  },
  {
    id: 'brief-generator',
    label: 'Brief Generator',
    description: 'Multi-step strategic engine: Client Brief → Business Briefcase → Creative Brief → PPT.',
    icon: <FileText size={18} className="text-white" />,
    to: '#',
    status: 'coming-soon',
    category: 'Brief & Strategy',
  },
  {
    id: 'campaign-creator',
    label: 'Campaign Creator',
    description: 'End-to-end campaign asset production across formats and platforms.',
    icon: <Layers2 size={18} className="text-white" />,
    to: '#',
    status: 'coming-soon',
    category: 'Brief & Strategy',
  },
  {
    id: 'video-creator',
    label: 'Video Creator',
    description: 'AI-assisted storyboard generation and video asset creation.',
    icon: <Video size={18} className="text-white" />,
    to: '#',
    status: 'coming-soon',
    category: 'Video',
  },
  {
    id: 'resizer',
    label: 'Resizer',
    description: 'Resize approved assets to all standard ad platform dimensions automatically.',
    icon: <Maximize2 size={18} className="text-white" />,
    to: '/resizer',
    status: 'live',
    category: 'Visual',
  },
  {
    id: 'deck-creation',
    label: 'Deck Creation',
    description: 'Generate presentation decks from brief content and brand templates.',
    icon: <PresentationIcon size={18} className="text-white" />,
    to: '#',
    status: 'coming-soon',
    category: 'Brief & Strategy',
  },
]

// ── Mock session data (would come from Lark/SSO in production) ────
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

// ── Helpers ───────────────────────────────────────────────────────
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

// ── Workspace Context Label ───────────────────────────────────────
function WorkspaceContextLabel() {
  const { workspace } = SESSION
  if (workspace.type === 'playground') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
        <FlaskConical size={12} className="text-gray-400" />
        <span>Playground — Personal Sandbox</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
      <Building2 size={12} className="text-gray-400" />
      <span className="text-gray-300 font-medium">{workspace.brandName}</span>
      <span className="text-white/20">·</span>
      <Lock size={10} className="text-green-400" />
      <span className="text-green-400">Brand Profile {workspace.brandProfileVersion}</span>
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
        onMouseLeave={() => setShowTooltip(false)}
        disabled={!isLive}
        className={`group w-full relative bg-white/5 border border-white/10 rounded-2xl p-5 text-left transition-all duration-200 ${
          isLive
            ? 'hover:bg-white/10 hover:border-white/20 cursor-pointer'
            : 'opacity-50 cursor-not-allowed'
        }`}
      >
        {/* Coming Soon badge */}
        {!isLive && (
          <span className="absolute top-3.5 right-3.5 text-xs font-semibold bg-white/10 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">
            Coming Soon
          </span>
        )}

        {/* Category tag */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            {tool.icon}
          </div>
          <span className="text-xs text-gray-500">{tool.category}</span>
        </div>

        {/* Label + desc */}
        <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">{tool.label}</h3>
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{tool.description}</p>

        {/* Footer */}
        {isLive && (
          <div className="flex items-center gap-1 text-xs text-gray-600 group-hover:text-gray-400 transition-colors">
            <span>Open tool</span>
            <ChevronRight size={12} />
          </div>
        )}
      </button>

      {/* Tooltip for Coming Soon */}
      {showTooltip && !isLive && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap z-10 pointer-events-none border border-white/10">
          Coming soon to FRnD Studio
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
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

  const liveTools = TOOL_REGISTRY.filter((t) => t.status === 'live')
  const comingSoonTools = TOOL_REGISTRY.filter((t) => t.status === 'coming-soon')

  const filteredTools = activeFilter === 'All'
    ? TOOL_REGISTRY
    : TOOL_REGISTRY.filter((t) => t.category === activeFilter)

  const filteredLive = filteredTools.filter((t) => t.status === 'live')
  const filteredComingSoon = filteredTools.filter((t) => t.status === 'coming-soon')

  return (
    <div className="min-h-screen bg-frnd-dark flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <Layers size={20} className="text-cimb-red" />
          <span className="text-white font-bold text-base tracking-tight">frndOS</span>
          <span className="text-white/20 mx-1">·</span>
          <span className="text-gray-500 text-sm">Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <WorkspaceContextLabel />
          <div className="w-8 h-8 rounded-full bg-cimb-red flex items-center justify-center text-xs font-bold text-white ml-2">
            {SESSION.initials}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-10 max-w-5xl mx-auto w-full">

        {/* Greeting */}
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-0.5">{getGreeting()}, {SESSION.firstName}</p>
          <h1 className="text-white text-3xl font-bold mb-1">
            {getRoleSubtitle(SESSION.role, SESSION.workspace.brandName)}
          </h1>
          <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
            <span>{liveTools.length} tools live</span>
            <span>·</span>
            <span>{comingSoonTools.length} coming soon</span>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === cat
                  ? 'bg-white text-frnd-dark'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live tools section */}
        {filteredLive.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Now</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredLive.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
            </div>
          </div>
        )}

        {/* Coming Soon section */}
        {filteredComingSoon.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Coming Soon</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredComingSoon.map((tool) => <ToolTile key={tool.id} tool={tool} />)}
            </div>
          </div>
        )}

        {/* No results from filter */}
        {filteredTools.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={28} className="text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">No tools in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
