import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export interface Group {
  id: number
  name: string
}

const QUERY_KEY = ['admin', 'groups'] as const

export function useAdminGroups() {
  const queryClient = useQueryClient()

  const query = useQuery<Group[]>({
    queryKey: QUERY_KEY,
    queryFn: () => $fetch('/api/admin/groups')
  })

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  const createGroup = useMutation({
    mutationFn: (body: { name: string }) =>
      $fetch('/api/admin/groups', { method: 'POST', body }),
    onSuccess: invalidate
  })

  const updateGroup = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      $fetch(`/api/admin/groups/${id}`, { method: 'PUT', body: { name } }),
    onSuccess: invalidate
  })

  const deleteGroup = useMutation({
    mutationFn: (id: number) =>
      $fetch(`/api/admin/groups/${id}`, { method: 'DELETE' }),
    onSuccess: invalidate
  })

  return { query, createGroup, updateGroup, deleteGroup }
}
