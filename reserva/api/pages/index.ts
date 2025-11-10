import supabase from '@/server/utils/supabase'
import { formatDateTimestamp } from '@/composables/formatDate'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id, page, pageSize, is_active } = getQuery(event)

    const pageNumber = page ? parseInt(page as string, 10) : 1
    const size = pageSize ? parseInt(pageSize as string, 10) : 10

    const from = (pageNumber - 1) * size
    const to = from + size - 1

    let query = supabase
      .from('pages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (typeof is_active !== 'undefined') {
      query = query.eq('is_active', is_active === 'true')
    }

    const { data, error, count } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    const formattedData = data.map((c: any) => ({
      ...c,
      created_at_formatted: c.created_at ? formatDateTimestamp(c.created_at, 3) : null,
    }))

    return {
      data: formattedData,
      count,
      page: pageNumber,
      pageSize: size,
      totalPages: Math.ceil((count ?? 0) / size)
    }
  }

  if (method === 'POST') {
    const bodyRequest = await readBody(event)
    let { title, body, description } = bodyRequest

    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'title is required' })
    }
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'body is required' })
    }

    title = emptyStringToNull(title)
    body = emptyStringToNull(body)
    description = emptyStringToNull(description)

    const { data, error } = await supabase
      .from('pages')
      .insert([{ title, body, description }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})

