import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface HRDashboardData {
  totalEmployees: number
  totalDepartments: number
  departmentsCount: number
  presentToday: number
  absentToday: number
  currentlyIn: number
  absent: number
  activeEmployees: number
  pendingLeaves: number
  expiringContracts: number
  departmentDistribution: Array<{ name: string; count: number }>
  employeesByDepartment: Array<{ department: string; count: number }>
  recentLeaves: Array<{
    id: number
    employee: string
    type: string
    dateFrom: string
    dateTo: string
    status: string
  }>
  todayAttendance?: unknown
}

export function useHRDashboard(params: number | { tenant_id: number } | null) {
  const tenant_id = params === null 
    ? null 
    : typeof params === 'number' 
      ? params 
      : params.tenant_id

  return useQuery({
    queryKey: ['hr-dashboard', tenant_id],
    queryFn: async () => {
      if (!tenant_id) {
        return {
          totalEmployees: 0,
          totalDepartments: 0,
          departmentsCount: 0,
          presentToday: 0,
          absentToday: 0,
          currentlyIn: 0,
          absent: 0,
          activeEmployees: 0,
          pendingLeaves: 0,
          expiringContracts: 0,
          departmentDistribution: [],
          employeesByDepartment: [],
          recentLeaves: [],
        }
      }
      
      const response = await api.post<{
        success?: boolean
        error?: string
        data?: HRDashboardData | { data: HRDashboardData }
      }>('/api/hr/dashboard', { tenant_id })

      const responseData = (response as any).data || response
      const dashboardData = responseData.data || responseData

      return {
        ...dashboardData,
        departmentsCount: dashboardData.departmentsCount || dashboardData.totalDepartments,
        todayAttendance: dashboardData.todayAttendance || [],
        isError: false,
      }
    },
    enabled: !!tenant_id,
  })
}
