import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })

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
    let { name, description, planned_at, observation, type, type_formatted, note } = body

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    if (!type) {
      throw createError({ statusCode: 400, statusMessage: 'type is required' })
    }

    if (!observation) {
      throw createError({ statusCode: 400, statusMessage: 'observation is required' })
    }

    name = emptyStringToNull(name)
    description = emptyStringToNull(description)
    observation = emptyStringToNull(observation)

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ name, description, planned_at, observation, type, type_formatted, note }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return {
      data,
      message: 'Tarefa criada com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
