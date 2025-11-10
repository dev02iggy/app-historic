import supabase from '@/server/utils/supabase'
import { formatDateTimestamp } from '@/composables/formatDate'

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Profile ID is required' })
  }

  if (method === 'GET') {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !profile) {
      throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
    }

    // Se quiser formatar datas ou outras coisas aqui, faça
    // Exemplo: profile.created_at_formatted = profile.created_at ? formatDateTimestamp(profile.created_at, 3) : null

    return profile
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
