import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'

type SLAStatus = 'on_track' | 'warning' | 'breached'

const slaConfig: Record<SLAStatus, { label: string; className: string; icon: typeof Clock }> = {
  on_track: { label: 'SLA OK', className: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  warning: { label: 'SLA attention', className: 'text-yellow-600 dark:text-yellow-400', icon: Clock },
  breached: { label: 'SLA d\u00E9pass\u00E9', className: 'text-red-600 dark:text-red-400', icon: AlertTriangle },
}

export function SLABadge({ status, deadline, label }: { status?: SLAStatus; deadline?: string; label?: string }) {
  if (!status) return null
  const config = slaConfig[status] || slaConfig.on_track
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label || config.label}
      {deadline && <span className="text-gray-500 dark:text-gray-400 ml-1">{deadline}</span>}
    </span>
  )
}
