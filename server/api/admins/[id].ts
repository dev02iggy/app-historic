import supabase from '../../utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

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
      .from('admins')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Admin not found'
      })
    }

    return data
  }


  if (method === 'PATCH') {
    const body = await readBody(event)
    const updateData: any = {}

    const fields = ['name', 'email', 'states', 'city', 'phone', 'birth_date', 'is_confirmation', 'code_confirmation'] // campos que podem ser atualizados
    for (const field of fields) {
      if (field in body) {
        updateData[field] = emptyStringToNull(body[field])
      }
    }
    if ('birth_date' in updateData) {
      updateData.birth_date = toISODate(updateData.birth_date)
    }
    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return data
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed'
  })
})
