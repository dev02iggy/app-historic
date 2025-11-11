import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// Esta função está correta (Front -> Banco)
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

// --- NOVO HELPER (Banco -> Front) ---
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

  return {
    ...link,
    created_at_formatted: link.created_at 
      ? new Date(link.created_at).toLocaleString('pt-BR', options) 
      : null,
    
    updated_at_formatted: link.updated_at
      ? new Date(link.updated_at).toLocaleString('pt-BR', options)
      : null,
      
    // O 'planned_at' está na sua lógica do PATCH, então formatamos ele também
    planned_at_formatted: link.planned_at
      ? new Date(link.planned_at).toLocaleString('pt-BR', options)
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
      statusMessage: 'ID do link é obrigatório'
    })
  }

  // --- GET (LEITURA) ---
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Link não foi encontrado'
      })
    }

    // --- NOVO: FORMATAÇÃO ---
    const formattedData = formatLinkDates(data);
    return formattedData; // <-- Retorna o dado formatado
    // --- FIM DA FORMATAÇÃO ---
  }

  // --- PATCH (ATUALIZAÇÃO PARCIAL) ---
  if (method === 'PATCH') {
    const body = await readBody(event);
    const updateData: { [key: string]: any } = {};

    // ... (Sua lógica de 'updateData' está correta) ...
    const textFields = ['description', 'link'];
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
    if (body.title !== undefined) {
        updateData.title = emptyStringToNull(body.title);
        if (!updateData.title) {
            throw createError({ statusCode: 400, statusMessage: 'O título não pode ser vazio' });
        }
    }
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nenhum dado para atualização foi fornecido'
      });
    }
    
    const { data, error } = await supabase
      .from('links')
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
        statusMessage: 'Link não encontrado para atualizar'
      });
    }

    // --- NOVO: FORMATAÇÃO ---
    const formattedData = formatLinkDates(data);
    
    // Sucesso!
    return {
      data: formattedData, // <-- Retorna o dado formatado
      message: 'Link atualizado com sucesso',
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