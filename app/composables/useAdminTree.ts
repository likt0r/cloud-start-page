import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export interface AccessGroup {
  serviceId: number
  keycloakGroup: string
}

export interface CompanionApp {
  id: number
  serviceId: number
  name: string
  platform: string | null
  storeUrl: string | null
  icon: string | null
}

export interface AdminService {
  id: number
  categoryId: number
  name: string
  description: string | null
  imagePath: string | null
  url: string
  sortOrder: number
  createdAt: string
  accessGroups: AccessGroup[]
  companionApps: CompanionApp[]
}

export interface AdminCategory {
  id: number
  title: string
  icon: string
  sortOrder: number
  services: AdminService[]
}

export interface ServiceFormPayload {
  categoryId: number
  name: string
  url: string
  description: string | null
  imagePath: string | null
  sortOrder: number
  accessGroups: string[]
}

const QUERY_KEY = ['admin', 'tree'] as const

export function useAdminTree() {
  const queryClient = useQueryClient()

  const query = useQuery<AdminCategory[]>({
    queryKey: QUERY_KEY,
    queryFn: () => $fetch('/api/admin/tree')
  })

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  const createCategory = useMutation({
    mutationFn: (body: { title: string; icon: string; sortOrder: number }) =>
      $fetch('/api/admin/categories', { method: 'POST', body }),
    onSuccess: invalidate
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, ...body }: { id: number; title: string; icon: string; sortOrder: number }) =>
      $fetch(`/api/admin/categories/${id}`, { method: 'PUT', body }),
    onSuccess: invalidate
  })

  const deleteCategory = useMutation({
    mutationFn: (id: number) =>
      $fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate
  })

  const createService = useMutation({
    mutationFn: (body: ServiceFormPayload) =>
      $fetch('/api/admin/services', { method: 'POST', body }),
    onSuccess: invalidate
  })

  const updateService = useMutation({
    mutationFn: ({ id, ...body }: { id: number } & ServiceFormPayload) =>
      $fetch(`/api/admin/services/${id}`, { method: 'PUT', body }),
    onSuccess: invalidate
  })

  const deleteService = useMutation({
    mutationFn: (id: number) =>
      $fetch(`/api/admin/services/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate
  })

  return {
    query,
    createCategory,
    updateCategory,
    deleteCategory,
    createService,
    updateService,
    deleteService
  }
}
