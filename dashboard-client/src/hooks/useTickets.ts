import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Ticket, CreateTicketData, TicketMessage } from '@/types/support'

interface TicketsFilters {
  state?: string
  priority?: string
  category?: string
  search?: string
}

export function useTickets(filters?: TicketsFilters) {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; tickets: Ticket[]; total: number }>(
        '/api/tickets',
        { params: filters }
      )
      return response
    },
  })
}

export function useTicketDetail(ticketId: number | null) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: async () => {
      if (!ticketId) return null
      const response = await api.get<{
        success: boolean
        ticket: Ticket
        messages: TicketMessage[]
      }>(`/api/tickets/${ticketId}`)
      return response
    },
    enabled: !!ticketId,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      const response = await api.post<{ success: boolean; ticket: Ticket }>(
        '/api/tickets',
        data
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useReplyTicket(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post<{ success: boolean; message: TicketMessage }>(
        `/api/tickets/${ticketId}/reply`,
        { content }
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useCloseTicket(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.patch<{ success: boolean; ticket: Ticket }>(
        `/api/tickets/${ticketId}/close`
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}

export function useRateTicket(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { rating: string; comment?: string }) => {
      const response = await api.post<{ success: boolean; ticket: Ticket }>(
        `/api/tickets/${ticketId}/rate`,
        data
      )
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })
}
