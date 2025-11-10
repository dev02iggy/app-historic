// server/api/profiles/index.ts
import supabase from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { id, type } = query

  if (!id || !type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id or type' })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  if (profile.type !== type) {
    throw createError({ statusCode: 403, statusMessage: 'User type mismatch' })
  }

  return profile
})



