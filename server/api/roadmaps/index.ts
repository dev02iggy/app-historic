import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// --- NOVO HELPER ---
// Esta função vai formatar nossas datas
function formatRoadmapDates(roadmap: any) {
  if (!roadmap) return roadmap;

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
    ...roadmap,
    created_at_formatted: roadmap.created_at 
      ? new Date(roadmap.created_at).toLocaleString('pt-BR', options) 
      : null,
    
    updated_at_formatted: roadmap.updated_at
      ? new Date(roadmap.updated_at).toLocaleString('pt-BR', options)
      : null,
      
    // Novo campo deste arquivo
    date_end_at_formatted: roadmap.date_end_at
      ? new Date(roadmap.date_end_at).toLocaleString('pt-BR', options)
      : null
  };
}
// --- FIM DO HELPER ---

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    let query = supabase.from('roadmaps').select('*').order('created_at', { ascending: false })

    if (profile_id) {
      query = query.eq('profile_id', profile_id as string)
    }

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    
    // --- NOVO: FORMATAÇÃO ---
    const formattedData = data ? data.map(formatRoadmapDates) : [];
    return formattedData; // <-- Retorna os dados formatados
    // --- FIM DA FORMATAÇÃO ---
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { name, description, date_end_at } = body

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }

    name = emptyStringToNull(name)
    description = emptyStringToNull(description)
    // (Você pode adicionar sua função toISODate aqui se precisar converter date_end_at)

    const { data, error } = await supabase
      .from('roadmaps')
      .insert([{ name, description, date_end_at }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    // --- NOVO: FORMATAÇÃO (para o item único) ---
    const formattedData = formatRoadmapDates(data);
    // --- FIM DA FORMATAÇÃO ---
    
    return {
      data: formattedData, // <-- Retorna o item formatado
      message: 'Roadmap criado com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
