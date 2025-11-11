import supabase from '../../../utils/supabase';

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

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID is required'
    })
  }


  if (method === 'PATCH') {
    const body = await readBody(event);
    const date = new Date();
    // --- A SOLUÇÃO: PAYLOAD DINÂMICO ---
    const payload: { [key: string]: any } = {};

    // Adiciona apenas os campos baseados no 'type'
    if (body.type === 'finished') {
      payload.is_finished = true;
      payload.finished_at = date;
      // (Opcional) resetar os outros estados
      payload.is_paused = false;
      payload.is_failured = false; 
    } 
    else if (body.type === 'paused') {
      payload.is_paused = true;
      payload.paused_at = date;
    } 
    else if (body.type === 'failured') {
      payload.is_failured = true; // <-- Corrigido (era is_failured)
      payload.failured_at = date; // <-- Corrigido (era failured_at)
      // (Opcional) resetar os outros estados
      payload.is_paused = false;
      payload.is_finished = false;
    }

    else {
      // Se o 'type' não for reconhecido, não faz nada
      throw createError({ statusCode: 400, statusMessage: 'Tipo de atualização inválido' });
    }

    const { data, error } = await supabase
      .from('roadmaps_items')
      .update(payload)
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
          statusMessage: 'Item não encontrado para atualizar'
        });
      }
  
      // --- NOVO: FORMATAÇÃO ---
      // 'data' é o objeto único que acabou de ser atualizado
      const formattedData = formatTaskDates(data);
      
      // Sucesso!
      return {
        data: formattedData, // <-- Retorna o dado formatado
        message: 'O item foi atualizado com sucesso',
        status: true
      };
  }

  // (Aqui você adicionaria seus métodos PATCH e DELETE no futuro)

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})