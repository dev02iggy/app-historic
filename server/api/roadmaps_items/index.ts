import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// --- NOVO HELPER ATUALIZADO (com os novos campos) ---
function formatItemDates(item: any) {
  if (!item) return item;

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
    ...item,
    created_at_formatted: item.created_at 
      ? new Date(item.created_at).toLocaleString('pt-BR', options) 
      : null,
    
    updated_at_formatted: item.updated_at
      ? new Date(item.updated_at).toLocaleString('pt-BR', options)
      : null,

    failured_at_formatted: item.failured_at // <-- NOVO
      ? new Date(item.failured_at).toLocaleString('pt-BR', options)
      : null,

    paused_at_formatted: item.paused_at // <-- NOVO
      ? new Date(item.paused_at).toLocaleString('pt-BR', options)
      : null,

    finished_at_formatted: item.finished_at // <-- NOVO
      ? new Date(item.finished_at).toLocaleString('pt-BR', options)
      : null,
      
    planned_at_formatted: item.planned_at
      ? new Date(item.planned_at).toLocaleString('pt-BR', options)
      : null
  };
}
// --- FIM DO HELPER ---

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
    
    // --- NOVO: FORMATAÇÃO ATUALIZADA ---
    const formattedData = data ? data.map(formatItemDates) : [];
    return formattedData; // <-- Retorna a lista formatada
    // --- FIM DA FORMATAÇÃO ---
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

    // --- NOVO: FORMATAÇÃO ATUALIZADA ---
    const formattedData = formatItemDates(data);
    // --- FIM DA FORMATAÇÃO ---
    
    return {
      data: formattedData, // <-- Retorna o item único formatado
      message: 'Item do roadmap criado com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})