import supabase from '../../utils/supabase'


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
  };
}
// --- FIM DO HELPER ---

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    let query = supabase.from('users').select('*')
      .order('created_at', { ascending: false })

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


  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
