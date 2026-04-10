import type { ProjectStatus } from '../../types'

const config: Record<ProjectStatus, { label: string; className: string; tooltip: string }> = {
  Draft: {
    label: 'Draft',
    className: 'bg-white/10 text-white/50 border border-white/10',
    tooltip: 'Project created but not yet generated.',
  },
  InProgress: {
    label: 'In Progress',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    tooltip: 'Generation started or editor opened — work is underway.',
  },
  Exported: {
    label: 'Exported',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    tooltip: 'Approved and downloaded — package delivered.',
  },
}

// StatusBadge — intentionally exports only the component, per react-refresh/only-export-components
export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = config[status]
  return (
    <span
      title={config[status].tooltip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

export const STATUS_EXPLANATIONS: Record<ProjectStatus, { title: string; description: string; trigger: string }> = {
  Draft: {
    title: 'Draft',
    description: 'Project has been created but no generation has been run yet.',
    trigger: 'Set automatically when a new project entry is created in the system.',
  },
  InProgress: {
    title: 'In Progress',
    description: 'At least one generation job has started, or the project was opened in the editor.',
    trigger: 'Triggered when: (1) Generate button is clicked in GeneratePage, or (2) Editor is opened for the project.',
  },
  Exported: {
    title: 'Exported',
    description: 'User has approved a variant and initiated download — the creative package has been delivered.',
    trigger: 'Triggered when: user clicks "Approve & Download" (original) or "Approve & Resize" in the editor.',
  },
}