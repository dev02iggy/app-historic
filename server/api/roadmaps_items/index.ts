import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { roadmap_id } = getQuery(event)
    let query = supabase.from('roadmaps_items').select('*').order('created_at', { ascending: false })

    if (roadmap_id) {
      query = query.eq('roadmap_id', roadmap_id as string)
    }

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { name, description, planned_at, objective, roadmap_id } = body

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    if (!roadmap_id) {
      throw createError({ statusCode: 400, statusMessage: 'roadmap_id is required' })
    }

    name = emptyStringToNull(name)
    description = emptyStringToNull(description)

    const { data, error } = await supabase
      .from('roadmaps_items')
      .insert([{ name, description, objective, planned_at, roadmap_id }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return {
      data,
      message: 'Item do roadmap criado com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
