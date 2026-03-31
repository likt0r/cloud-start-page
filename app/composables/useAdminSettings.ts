import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'

export interface SiteSettings {
  id: number
  loginButtonText: string
  pageTitle: string
  logoPath: string
  logoSmallPath: string
}

export type SettingsUpdatePayload = Omit<SiteSettings, 'id'>

const QUERY_KEY = ['admin', 'settings'] as const

export function useAdminSettings() {
  const queryClient = useQueryClient()

  const query = useQuery<SiteSettings>({
    queryKey: QUERY_KEY,
    queryFn: () => $fetch('/api/admin/settings')
  })

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  const updateSettings = useMutation({
    mutationFn: (body: SettingsUpdatePayload) =>
      $fetch('/api/admin/settings', { method: 'PUT', body }),
    onSuccess: invalidate
  })

  return { query, updateSettings }
}
