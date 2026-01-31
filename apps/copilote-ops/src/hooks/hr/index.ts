/**
 * Hooks HR - Stubs pour copilote-ops
 * Les données proviennent de l'API backend via useApiData
 */
import { useState, useCallback } from 'react'

export interface HRDashboardData {
  totalEmployees: number
  totalDepartments: number
  presentToday: number
  absentToday: number
  pendingLeaves: number
  expiringContracts: number
  departmentDistribution: Array<{ name: string; count: number }>
  recentLeaves: Array<{
    id: number
    employee: string
    type: string
    dateFrom: string
    dateTo: string
    status: string
  }>
}

export function useHRDashboard() {
  const [isLoading] = useState(false)
  const [data] = useState<HRDashboardData>({
    totalEmployees: 0,
    totalDepartments: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    expiringContracts: 0,
    departmentDistribution: [],
    recentLeaves: [],
  })

  const refresh = useCallback(() => {
    // Will be connected to API
  }, [])

  return { data, isLoading, error: null, refresh }
}

export interface LeaveRequest {
  id: number
  employee: string
  employeeId: number
  type: string
  typeId: number
  dateFrom: string
  dateTo: string
  days: number
  status: 'draft' | 'pending' | 'approved' | 'refused'
  reason?: string
}

export function useLeaves() {
  const [isLoading] = useState(false)
  const [data] = useState<LeaveRequest[]>([])

  return { data, isLoading, error: null }
}

export function useLeaveActions() {
  const approve = useCallback(async (_id: number) => { /* API */ }, [])
  const refuse = useCallback(async (_id: number) => { /* API */ }, [])
  return { approve, refuse }
}

export interface LeaveType {
  id: number
  name: string
  color: string
  maxDays: number
  requiresApproval: boolean
}

export function useLeaveTypes() {
  const [isLoading] = useState(false)
  const [data] = useState<LeaveType[]>([])
  return { data, isLoading, error: null }
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

export function useLeaveAllocations() {
  const [isLoading] = useState(false)
  const [data] = useState<LeaveAllocation[]>([])
  return { data, isLoading, error: null }
}

export function useLeavesCalendar(_year: number, _month: number, _filters?: { departmentId?: number; employeeId?: number }) {
  const [isLoading] = useState(false)
  const [data] = useState<Record<string, Array<{ employee: string; type: string; color: string }>>>({})
  return { data, isLoading, error: null }
}

export type Leave = LeaveRequest

export function useApproveLeave() {
  const mutate = useCallback(async (_id: number) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useRefuseLeave() {
  const mutate = useCallback(async (_id: number) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export function useLeaveBalances(_params?: { year?: number }) {
  const [isLoading] = useState(false)
  const [data] = useState<LeaveAllocation[]>([])
  return { data, isLoading, error: null, allocations: data }
}

export function useBulkCreateAllocations() {
  const mutate = useCallback(async (_data: Partial<LeaveAllocation>[]) => { /* API */ }, [])
  return { mutate, isLoading: false }
}

export interface Department {
  id: number
  name: string
  managerId?: number
  managerName?: string
  employeeCount: number
}

export function useDepartments() {
  const [isLoading] = useState(false)
  const [data] = useState<Department[]>([])
  return { data, isLoading, error: null }
}
