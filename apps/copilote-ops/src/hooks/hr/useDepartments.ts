import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Department {
  id: number
  name: string
  managerId?: number
  managerName?: string
  employeeCount: number
}

export function useDepartments(params: number | { tenant_id: number } | null) {
  const tenant_id = params === null 
    ? null 
    : typeof params === 'number' 
      ? params 
      : params.tenant_id

  return useQuery({
    queryKey: ['hr-departments', tenant_id],
    queryFn: async () => {
      if (!tenant_id) return { data: [], departments: [], total: 0 }
      
      const response: any = await api.post('/api/hr/departments', { tenant_id })

      // Handle both response formats
      const departments = response?.departments || response?.data?.departments || response?.data || []

      return {
        data: departments,
        departments: departments,
        total: response?.total || response?.data?.total || departments.length,
      }
    },
    enabled: !!tenant_id,
  })
}
