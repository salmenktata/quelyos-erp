import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface LeaveRequest {
  id: number
  employee: string
  employee_name: string
  employeeId: number
  type: string
  leave_type_name: string
  typeId: number
  dateFrom: string
  date_from: string
  dateTo: string
  date_to: string
  days: number
  number_of_days: number
  status: 'draft' | 'pending' | 'approved' | 'refused'
  state: 'draft' | 'pending' | 'approved' | 'refused'
  state_label: string
  reason?: string
  notes?: string
}

interface LeavesParams {
  tenant_id: number
  state?: string
  leave_type_id?: number
  limit?: number
  offset?: number
}

export function useLeaves(params: number | LeavesParams) {
  const queryParams = typeof params === 'number' 
    ? { tenant_id: params }
    : params

  return useQuery({
    queryKey: ['hr-leaves', queryParams],
    queryFn: async () => {
      const response = await api.post<{
        success: boolean
        error?: string
        leaves?: LeaveRequest[]
        data?: LeaveRequest[] | { leaves: LeaveRequest[], data: LeaveRequest[] }
        total?: number
      }>('/api/hr/leaves', queryParams)

      const responseData = (response as any).data || response
      const leavesData = responseData.leaves || responseData.data || responseData || []
      const totalCount = responseData.total || 0

      return {
        leaves: leavesData,
        data: leavesData,
        total: totalCount,
      }
    },
    enabled: !!queryParams.tenant_id,
  })
}

export function useApproveLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<{
        success: boolean
        error?: string
      }>(`/api/hr/leaves/${id}/approve`, {})

      if (!response.success) {
        throw new Error(response.error || 'Erreur approbation')
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leaves'] })
    },
  })
}

export function useRefuseLeave() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await api.post<{
        success: boolean
        error?: string
      }>(`/api/hr/leaves/${id}/refuse`, {})

      if (!response.success) {
        throw new Error(response.error || 'Erreur refus')
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leaves'] })
    },
  })
}

export type Leave = LeaveRequest

export interface LeaveType {
  id: number
  name: string
  code: string
  color: string
  maxDays: number
  max_days: number
  requiresApproval: boolean
  requires_allocation: boolean
  validation_type: string
  request_unit: string
  unpaid: boolean
  active: boolean
}

export function useLeaveTypes(tenantId: number | { tenant_id: number }) {
  const tenant_id = typeof tenantId === 'number' ? tenantId : tenantId.tenant_id

  return useQuery({
    queryKey: ['hr-leave-types', tenant_id],
    queryFn: async () => {
      const response = await api.post<{
        success?: boolean
        error?: string
        data?: LeaveType[]
        types?: LeaveType[]
        total?: number
      }>('/api/hr/leave-types', { tenant_id })

      const responseData = (response as any).data || response
      const typesData = responseData.data || responseData.types || responseData || []
      const totalCount = responseData.total || typesData.length

      return {
        data: typesData,
        types: typesData,
        total: totalCount,
      }
    },
    enabled: !!tenant_id,
  })
}

export interface LeaveAllocation {
  id: number
  employee: string
  employeeId: number
  type: string
  typeId: number
  allocated: number
  taken: number
  remaining: number
  year: number
}

export function useLeaveAllocations(params: number | { tenant_id: number; year?: number }) {
  const queryParams = typeof params === 'number' 
    ? { tenant_id: params }
    : params

  return useQuery({
    queryKey: ['hr-leave-allocations', queryParams],
    queryFn: async () => {
      const response = await api.post<{
        success?: boolean
        error?: string
        data?: LeaveAllocation[]
        allocations?: LeaveAllocation[]
        total?: number
      }>('/api/hr/leave-allocations', queryParams)

      const responseData = (response as any).data || response
      const allocationsData = responseData.allocations || responseData.data || responseData || []
      const totalCount = responseData.total || allocationsData.length

      return {
        data: allocationsData,
        allocations: allocationsData,
        total: totalCount,
      }
    },
    enabled: !!queryParams.tenant_id,
  })
}

export function useLeaveBalances(params: { year?: number; tenant_id?: number; tenantId?: number }) {
  const tenant_id = params.tenant_id || params.tenantId

  return useQuery({
    queryKey: ['hr-leave-balances', params],
    queryFn: async () => {
      if (!tenant_id) return { data: [], allocations: [] }
      
      const response = await api.post<{
        success?: boolean
        error?: string
        data?: LeaveAllocation[]
        allocations?: LeaveAllocation[]
      }>('/api/hr/leave-balances', { tenant_id, year: params.year })

      const responseData = (response as any).data || response
      const allocationsData = responseData.allocations || responseData.data || responseData || []

      return {
        data: allocationsData,
        allocations: allocationsData,
      }
    },
    enabled: !!tenant_id,
  })
}

export function useLeavesCalendar(
  year: number, 
  month: number, 
  filters?: { departmentId?: number; employeeId?: number; tenantId?: number; tenant_id?: number }
) {
  const tenant_id = filters?.tenantId || filters?.tenant_id

  return useQuery({
    queryKey: ['hr-leaves-calendar', year, month, filters],
    queryFn: async () => {
      if (!tenant_id) return { data: {} }
      
      const response = await api.post<{
        success?: boolean
        error?: string
        data?: Record<string, Array<{ employee: string; type: string; color: string }>>
      }>('/api/hr/leaves/calendar', { 
        tenant_id,
        year, 
        month,
        department_id: filters?.departmentId,
        employee_id: filters?.employeeId,
      })

      const responseData = (response as any).data || response
      
      return { data: responseData.data || responseData || {} }
    },
    enabled: !!tenant_id,
  })
}

export function useBulkCreateAllocations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (allocations: Partial<LeaveAllocation>[] | { tenant_id: number; allocations: Partial<LeaveAllocation>[] }) => {
      const data = Array.isArray(allocations) 
        ? { allocations } 
        : allocations

      const response = await api.post<{
        success: boolean
        error?: string
      }>('/api/hr/leave-allocations/bulk', data)

      if (!response.success) {
        throw new Error(response.error || 'Erreur création allocations')
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-leave-allocations'] })
      queryClient.invalidateQueries({ queryKey: ['hr-leave-balances'] })
    },
  })
}

export function useLeaveActions() {
  const approve = useApproveLeave()
  const refuse = useRefuseLeave()
  
  return { 
    approve: approve.mutate, 
    refuse: refuse.mutate 
  }
}
