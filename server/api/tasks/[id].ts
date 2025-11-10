import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

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

export default defineEventHandler(async (event) => {
  const method = event.req.method
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da tarefa é obrigatório'
    })
  }

  // --- GET (LEITURA) ---
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tarefa não foi encontrada'
      })
    }

    return data
  }

  // --- PATCH (ATUALIZAÇÃO PARCIAL) ---
  if (method === 'PATCH') {
    const body = await readBody(event);
    const updateData: { [key: string]: any } = {};

    const textFields = ['description', 'type', 'type_formatted', 'observation', 'note'];
    for (const field of textFields) {
        if (body[field] !== undefined) {
            updateData[field] = emptyStringToNull(body[field]);
        }
    }

    const dateFields = ['planned_at'];
    for (const field of dateFields) {
        if (body[field] !== undefined) {
            updateData[field] = toISODate(body[field]);
        }
    }
    if (body.name !== undefined) {
        updateData.name = emptyStringToNull(body.name);
        if (!updateData.name) {
            throw createError({ statusCode: 400, statusMessage: 'O nome não pode ser vazio' });
        }
    }

    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum dado para atualização foi fornecido'
      });
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
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

    // Sucesso!
    return {
      data,
      message: 'Tarefa atualizada com sucesso',
      status: true
    };
  }


  // --- MÉTODO NÃO PERMITIDO ---
  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})