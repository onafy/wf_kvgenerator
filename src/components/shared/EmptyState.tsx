import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description: string
  primaryAction?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, primaryAction, secondaryAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
      <div className="flex gap-3">
        {primaryAction && (
          <button onClick={primaryAction.onClick} className="px-5 py-2.5 bg-cimb-red text-white text-sm font-medium rounded-lg hover:bg-red-800 transition-colors">
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button onClick={secondaryAction.onClick} className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  )
}
