/*import supabase from '../../utils/supabase'
import { formatDateTimestamp } from '@/composables/formatDate'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const query = getQuery(event)

    const profile_id = query.profile_id as string | undefined
    const page = query.page ? parseInt(query.page as string, 10) : 1
    const pageSize = query.pageSize ? parseInt(query.pageSize as string, 10) : 10

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let queryBuilder = supabase
      .from('admins')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (profile_id) {
      queryBuilder = queryBuilder.eq('profile_id', profile_id)
    }

    const { data, error, count } = await queryBuilder

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    const formattedData = data.map((admin: any) => ({
      ...admin,
      created_at_formatted: admin.created_at ? formatDateTimestamp(admin.created_at, 3) : null,
      updated_at_formatted: admin.updated_at ? formatDateTimestamp(admin.updated_at, 3) : null,
      address: `${admin.city || ''} - ${admin.state || ''}`.trim().replace(/^-\s*|\s*-\s*$/g, '')
    }))

    return {
      data: formattedData,
      count,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize)
    }
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const {
      name,
      email,
      profile_id,
      phone,
      state,
      city,
    } = body

    if (!name || !email || !profile_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: name, email and profile_id'
      })
    }

    // Faz a conversão de strings vazias para null nos campos opcionais
    const dataToInsert = {
      name,
      email,
      profile_id,
      phone: emptyStringToNull(phone),
      state: emptyStringToNull(state),
      city: emptyStringToNull(city),
      image_url: null,
      image_id: null
      // outros campos que desejar aqui
    }

    const { data, error } = await supabase
      .from('admins')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return data
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})*/
