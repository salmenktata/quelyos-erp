import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { odooRpc } from '@/lib/odoo-rpc'

export interface MenuItem {
  id: number
  name: string
  code: string
  label: string
  url: string
  icon?: string
  description?: string
  parent_id?: number | null
  sequence: number
  active: boolean
  open_new_tab: boolean
  requires_auth: boolean
  css_class?: string
  children?: MenuItem[]
  children_count?: number
}

export function useMenus() {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const response = await odooRpc<{ menus: MenuItem[] }>('/api/ecommerce/menus/list')
      return response
    },
  })
}

export function useCreateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<MenuItem>) =>
      odooRpc('/api/ecommerce/menus/create', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useUpdateMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<MenuItem> & { id: number }) =>
      odooRpc(`/api/ecommerce/menus/${id}/update`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useDeleteMenu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      odooRpc(`/api/ecommerce/menus/${id}/delete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}

export function useReorderMenus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (menuIds: number[]) =>
      odooRpc('/api/ecommerce/menus/reorder', { menu_ids: menuIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] })
    },
  })
}
