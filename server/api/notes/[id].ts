import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

// Esta função está correta (Front -> Banco)
function toISODate(value: any) {
  if (!value) return null;

  // Trata string no formato DD/MM/YYYY
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    // Garante que mês e dia tenham 2 dígitos
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().substring(0, 10);
  }

  // Caso já seja uma data em formato ISO ou outro formato reconhecido
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().substring(0, 10);
}

// --- NOVO HELPER (Banco -> Front) ---
// Esta função vai formatar nossas datas
function formatNoteDates(note: any) {
  if (!note) return note;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false // Formato 24h
  };

  return {
    ...note,
    created_at_formatted: note.created_at 
      ? new Date(note.created_at).toLocaleString('pt-BR', options) 
      : null,
    
    updated_at_formatted: note.updated_at
      ? new Date(note.updated_at).toLocaleString('pt-BR', options)
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
      statusMessage: 'ID is required'
    })
  }

  if (method === 'GET') {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Nota não foi encontrada'
      })
    }

    // --- NOVO: FORMATAÇÃO ---
    // 'data' é um objeto único
    const formattedData = formatNoteDates(data);
    return formattedData; // <-- Retorna o dado formatado
    // --- FIM DA FORMATAÇÃO ---
  }

  // (Aqui você adicionaria seus métodos PATCH e DELETE no futuro)

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})