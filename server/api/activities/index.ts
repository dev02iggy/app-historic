import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { task_id } = getQuery(event)
    let query = supabase.from('activities').select('*').order('created_at', { ascending: false })

    if (task_id) {
      query = query.eq('task_id', task_id as string)
    }

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { name, planned_at, description, task_id } = body

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    if (!task_id) {
      throw createError({ statusCode: 400, statusMessage: 'task_id is required' })
    }

    name = emptyStringToNull(name)
    description = emptyStringToNull(description)

    const { data, error } = await supabase
      .from('activities')
      .insert([{ name, description, planned_at, task_id }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return {
      data,
      message: 'Atividade da tarefa criada com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
