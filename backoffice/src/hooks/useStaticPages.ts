import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { odooRpc } from '@/lib/odoo-rpc'

export interface StaticPage {
  id: number
  name: string
  slug: string
  title: string
  subtitle?: string
  content: string
  layout: 'default' | 'with_sidebar' | 'full_width' | 'narrow'
  show_sidebar: boolean
  sidebar_content?: string
  header_image_url?: string
  show_header_image: boolean
  meta_title?: string
  meta_description?: string
  show_in_footer: boolean
  footer_column?: 'company' | 'help' | 'legal'
  show_in_menu: boolean
  menu_position: number
  active: boolean
  views_count?: number
  published_date?: string
}

export function useStaticPages() {
  return useQuery({
    queryKey: ['staticPages'],
    queryFn: async () => {
      const response = await odooRpc<{ pages: StaticPage[] }>('/api/ecommerce/pages')
      return response.pages || []
    },
  })
}

export function useCreateStaticPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<StaticPage>) => odooRpc('/api/ecommerce/pages/create', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staticPages'] }),
  })
}

export function useUpdateStaticPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<StaticPage> & { id: number }) =>
      odooRpc(`/api/ecommerce/pages/${id}/update`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staticPages'] }),
  })
}

export function useDeleteStaticPage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => odooRpc(`/api/ecommerce/pages/${id}/delete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['staticPages'] }),
  })
}
