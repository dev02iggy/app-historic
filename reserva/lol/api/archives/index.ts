import supabase from '@/server/utils/supabase'

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'POST') {
    const parts: any = await readMultipartFormData(event)
    const filePart = parts.find((p: any) => p.name === 'file')

    if (!filePart || !filePart.data) {
      throw createError({ statusCode: 400, statusMessage: 'File is required' })
    }

    if (filePart.type !== 'application/pdf') {
      throw createError({ statusCode: 400, statusMessage: 'Only PDF files are allowed' })
    }

    // Espera candidate_id para ambos os casos
    const { candidate_id, candidature_id, type } = getQuery(event) // type: 'candidate' ou 'candidature'

    if (type !== 'candidate' && type !== 'candidature') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid type. Must be "candidate" or "candidature"' })
    }

    if (type === 'candidate' && !candidate_id) {
      throw createError({ statusCode: 400, statusMessage: 'candidate_id is required' })
    }

    if (type === 'candidature' && !candidature_id) {
      throw createError({ statusCode: 400, statusMessage: 'candidature_id is required' })
    }

    const folder = type === 'candidate' ? 'candidate' : 'candidature'
    const fileName = `${folder}/${Date.now()}_${filePart.filename}`

    const bucketName = 'resumes'

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, filePart.data, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf'
      })

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    const { data: dataURL } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    const table = type === 'candidate' ? 'candidates' : 'candidatures'

    const updateFields = {
      curriculum_id: fileName,
      curriculum_url: dataURL.publicUrl
    }

    // Atualiza pelo candidate_id ou candidature_id
    let query = supabase.from(table).update(updateFields)
    if (type === 'candidate') {
      query = query.eq('id', candidate_id)
    } else {
      query = query.eq('id', candidature_id)
    }

    const { error: updateError } = await query

    if (updateError) {
      throw createError({ statusCode: 500, statusMessage: updateError.message })
    }

    return {
      curriculum_id: fileName,
      curriculum_url: dataURL.publicUrl
    }
  }

  if (method === 'DELETE') {
    const { curriculum_id, candidate_id, candidature_id, type }: any = getQuery(event)

    if (!curriculum_id) {
      throw createError({ statusCode: 400, statusMessage: 'curriculum_id is required' })
    }

    if (type !== 'candidate' && type !== 'candidature') {
      throw createError({ statusCode: 400, statusMessage: 'Invalid type. Must be "candidate" or "candidature"' })
    }

    const bucketName = 'resumes'

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([curriculum_id])

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }

    if (type === 'candidate' && candidate_id) {
      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          curriculum_id: null,
          curriculum_url: null
        })
        .eq('id', candidate_id)

      if (updateError) {
        throw createError({ statusCode: 500, statusMessage: updateError.message })
      }
    }

    if (type === 'candidature' && candidature_id) {
      const { error: updateError } = await supabase
        .from('candidatures')
        .update({
          curriculum_id: null,
          curriculum_url: null
        })
        .eq('id', candidature_id)

      if (updateError) {
        throw createError({ statusCode: 500, statusMessage: updateError.message })
      }
    }

    return { message: 'Curriculum deleted' }
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})

