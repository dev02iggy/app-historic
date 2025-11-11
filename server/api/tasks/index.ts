import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// --- NOVO HELPER ---
// Esta função vai formatar nossas datas
// Ela também lida com datas que podem ser nulas (como planned_at)
function formatTaskDates(task: any) {
  if (!task) return task;

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
    ...task,
    // Se a data existir, formata. Senão, retorna null.
    created_at_formatted: task.created_at 
      ? new Date(task.created_at).toLocaleString('pt-BR', options) 
      : null,
    
    updated_at_formatted: task.updated_at
      ? new Date(task.updated_at).toLocaleString('pt-BR', options)
      : null,
      
    planned_at_formatted: task.planned_at
      ? new Date(task.planned_at).toLocaleString('pt-BR', options)
      : null
  };
}
// --- FIM DO HELPER ---

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    let query = supabase.from('tasks').select('*')
      // 1. Ordena por 'planned_at' (datas mais próximas vêm primeiro)
      //    'nullsfirst: false' joga todas as tarefas SEM data para o FIM da lista
      .order('planned_at', { ascending: true, nullsFirst: false })
      .eq('is_closed', false)
      
      // 2. Desempate: se as datas forem iguais (ou nulas), ordena pelas mais novas
      .order('created_at', { ascending: false })
      .eq('is_closed', false)

    if (profile_id) {
      query = query.eq('profile_id', profile_id as string)
    }

    const { data, error } = await query
    
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    // --- NOVO: FORMATAÇÃO ---
    // 'data' é um array. Usamos .map() para formatar cada item
    const formattedData = data ? data.map(formatTaskDates) : [];
    
    return formattedData; // <-- Retorna os dados formatados
    // --- FIM DA FORMATAÇÃO ---
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { name, description, planned_at, observation, type, type_formatted, note } = body

    if (!name) {
      throw createError({ statusCode: 400, statusMessage: 'name is required' })
    }
    // ... (suas outras validações) ...

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

    // --- NOVO: FORMATAÇÃO (para o item único) ---
    // 'data' aqui é um objeto único.
    const formattedData = formatTaskDates(data);
    // --- FIM DA FORMATAÇÃO ---
    
    return {
      data: formattedData, // <-- Retorna o item formatado
      message: 'Tarefa criada com sucesso',
      status: true
    }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})