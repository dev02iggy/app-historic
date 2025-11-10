import supabase from '@/server/utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    let query = supabase.from('activities').select('*').order('created_at', { ascending: false })

    if (profile_id) {
      query = query.eq('profile_id', profile_id as string)
    }

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { title, description, profile_id } = body

    if (!profile_id) {
      throw createError({ statusCode: 400, statusMessage: 'profile_id is required' })
    }
    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'title is required' })
    }

    title = emptyStringToNull(title)
    description = emptyStringToNull(description)

    const { data, error } = await supabase
      .from('activities')
      .insert([{ title, description, profile_id }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
