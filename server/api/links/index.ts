import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// --- NOVO HELPER ---
// Esta função vai formatar nossas datas
function formatLinkDates(link: any) {
  if (!link) return link;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24h
  };

  // Retorna o objeto original, mais as novas colunas formatadas
  return {
    ...link,
    created_at_formatted: link.created_at 
      ? new Date(link.created_at).toLocaleString('pt-BR', options) 
      : null,
    
    updated_at_formatted: link.updated_at
      ? new Date(link.updated_at).toLocaleString('pt-BR', options)
      : null
  };
}
// --- FIM DO HELPER ---

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id, year, month } = getQuery(event)
    let query = supabase.from('links').select('*').order('created_at', { ascending: false })

    if (profile_id) {
      query = query.eq('profile_id', profile_id as string)
    }

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    
    // --- NOVO: FORMATAÇÃO ---
    const formattedData = data ? data.map(formatLinkDates) : [];
    return formattedData; // <-- Retorna os dados formatados
    // --- FIM DA FORMATAÇÃO ---
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { title, description, link } = body

    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'o título é requerido' })
    }
    if (!link) {
      throw createError({ statusCode: 400, statusMessage: 'O link é requerido' })
    }

    title = emptyStringToNull(title)
    description = emptyStringToNull(description)
    link = emptyStringToNull(link)

    const { data, error } = await supabase
      .from('links')
      .insert([{ title, description, link }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    // --- NOVO: FORMATAÇÃO ---
    const formattedData = formatLinkDates(data);
    // --- FIM DA FORMATAÇÃO ---

    return {
      data: formattedData, // <-- Retorna o item formatado
      message: 'Link criado com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})