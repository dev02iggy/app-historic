import supabase from '@/server/utils/supabase'
import { formatDateTimestamp } from '@/composables/formatDate'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    if (!profile_id) {
      throw createError({ statusCode: 400, statusMessage: 'profile_id is required' })
    }

    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('profile_id', profile_id)

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    const formattedData = data.map((candidate: any) => ({
      ...candidate,
      created_at_formatted: candidate.created_at ? formatDateTimestamp(candidate.created_at, 3) : null,
      updated_at_formatted: candidate.updated_at ? formatDateTimestamp(candidate.updated_at, 3) : null,
      address: `${candidate.city || ''} - ${candidate.state || ''}`.trim().replace(/^-\s*|\s*-\s*$/g, '')
    }))

    return formattedData
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const {
      name,
      email,
      profile_id,
      phone,
      birth_date,
      cpf,
      state,
      city,
      about,
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
      birth_date: emptyStringToNull(birth_date),
      cpf: emptyStringToNull(cpf),
      state: emptyStringToNull(state),
      city: emptyStringToNull(city),
      about: emptyStringToNull(about),
      image_url: null,
      image_id: null,
      completion_percentage: 5,
      completion_percentage_formatted: `5%`
      // outros campos que desejar aqui
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([dataToInsert])
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    const { data: dataExperience, error: errorExperience } = await supabase
      .from('experience_group')
      .insert([{ candidate_id: data.id }])
      .select()
      .single()

    if (errorExperience) {
      throw createError({
        statusCode: 500,
        statusMessage: errorExperience.message
      })
    }

    return data
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
