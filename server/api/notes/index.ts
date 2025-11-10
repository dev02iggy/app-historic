import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id, year, month } = getQuery(event)
    let query = supabase.from('notes').select('*').order('created_at', { ascending: false })

    if (profile_id) {
      query = query.eq('profile_id', profile_id as string)
    }

    // --- A MÁGICA ESTÁ AQUI ---
    if (year && month) {
      // Converte para números
      // O 'month' do JavaScript é 0-indexado (0=Janeiro, 11=Dezembro)
      // Vamos assumir que o frontend envie '1' para Janeiro, '10' para Outubro, etc.
      const yearNum = parseInt(year as string)
      const monthIndex = parseInt(month as string) - 1 // Converte '10' (Out) para '9'

      // Cria a data de INÍCIO (ex: 1 de Outubro de 2025, 00:00:00)
      const startDate = new Date(yearNum, monthIndex, 1).toISOString()

      // Cria a data de FIM (ex: 31 de Outubro de 2025, 23:59:59)
      // Truque: vá para o próximo mês (monthIndex + 1) e peça o dia 0.
      const endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999).toISOString()

      // Aplica o filtro de range no Supabase
      query = query.gte('created_at', startDate) // "greater than or equal to"
      query = query.lte('created_at', endDate)   // "less than or equal to"
    }
    // --- FIM DA MÁGICA ---

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { title, details, observations, customer_impact } = body

    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'title is required' })
    }

    title = emptyStringToNull(title)
    details = emptyStringToNull(details)
    observations = emptyStringToNull(observations)
    customer_impact = emptyStringToNull(customer_impact)

    const { data, error } = await supabase
      .from('notes')
      .insert([{ title, details, observations, customer_impact }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return {
      data,
      message: 'Nota criada com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
