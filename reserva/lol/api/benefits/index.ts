import supabase from '@/server/utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)

    let query = supabase.from('benefits').select('*').order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
  }


  if (method === 'POST') {
    const body = await readBody(event)
    let { title, icon, description, subtitle } = body


    // Converte strings vazias para null
    title = emptyStringToNull(title)
    icon = emptyStringToNull(icon)
    description = emptyStringToNull(description)
    subtitle = emptyStringToNull(subtitle)

    const { data, error } = await supabase
      .from('benefits')
      .insert([{ title, icon, description, subtitle }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})


