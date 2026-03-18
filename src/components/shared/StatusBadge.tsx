import type { ProjectStatus } from '../../types'

const config: Record<ProjectStatus, { label: string; className: string }> = {
  Draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600' },
  InProgress: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  Exported: { label: 'Exported', className: 'bg-green-100 text-green-700' },
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
