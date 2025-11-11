import supabase from '../../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// Esta função (toISODate) está correta.
// Ela converte do front (DD/MM/YYYY) para o banco (ISO), 
// usada no PATCH.
function toISODate(value: any) {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const d = new Date(isoString);
    
    if (isNaN(d.getTime())) return null;
    
    return d.toISOString().substring(0, 10);
  }

  const d = new Date(value);
  if (isNaN(d.getTime())) return null; // Inválido
  
  return d.toISOString().substring(0, 10);
}

// --- NOVO HELPER (O mesmo do outro arquivo) ---
// Esta função converte do banco (ISO) para o front (DD/MM/YYYY HH:MM)
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
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da tarefa é obrigatório'
    })
  }

  // --- PATCH (ATUALIZAÇÃO PARCIAL) ---
  if (method === 'PATCH') {
    const body = await readBody(event);
    const updateData: { [key: string]: any } = {};

    const date = new Date();
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ is_finished: true, is_closed: true, finished_at: date })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error.message);
      throw createError({ statusCode: 500, statusMessage: error.message });
    }
    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tarefa não encontrada para atualizar'
      });
    }

    // --- NOVO: FORMATAÇÃO ---
    // 'data' é o objeto único que acabou de ser atualizado
    const formattedData = formatTaskDates(data);
    
    // Sucesso!
    return {
      data: formattedData, // <-- Retorna o dado formatado
      message: 'Tarefa finalizada com sucesso',
      status: true
    };
    // --- FIM DA FORMATAÇÃO ---
  }


  // --- MÉTODO NÃO PERMITIDO ---
  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})