export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketState = 'new' | 'in_progress' | 'waiting' | 'resolved' | 'closed' | 'cancelled'

export type TicketCategory =
  | 'technical'
  | 'billing'
  | 'bug'
  | 'feature_request'
  | 'question'
  | 'order'
  | 'delivery'
  | 'return'
  | 'refund'
  | 'payment'
  | 'account'
  | 'other'

export interface TicketMessage {
  id: number
  ticket_id: number
  author_id: number
  author_name: string
  authorName?: string
  content: string
  message_type: 'comment' | 'internal' | 'system'
  created_at: string
  createdAt?: string
  isStaff?: boolean
  attachments?: { id: number; name: string; url: string }[]
}

export interface Ticket {
  id: number
  reference: string
  subject: string
  description: string
  state: TicketState
  priority: TicketPriority
  category_id?: number
  category_name?: string
  partner_id?: number
  partner_name?: string
  partner_email?: string
  assigned_id?: number
  assigned_name?: string
  team_id?: number
  team_name?: string
  sla_deadline?: string
  sla_status?: 'on_track' | 'warning' | 'breached'
  slaFirstResponseStatus?: 'on_track' | 'warning' | 'breached'
  slaFirstResponseDeadline?: string
  slaResolutionStatus?: 'on_track' | 'warning' | 'breached'
  slaResolutionDeadline?: string
  rating?: string
  rating_comment?: string
  tags?: { id: number; name: string }[]
  message_count?: number
  messageCount?: number
  created_at: string
  createdAt?: string
  updated_at: string
  closed_at?: string
}

export interface CreateTicketData {
  subject: string
  description: string
  priority?: TicketPriority
  category?: TicketCategory
  category_id?: number
  partner_id?: number
  tags?: number[]
}
