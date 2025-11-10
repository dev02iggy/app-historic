import supabase from '@/server/utils/supabase'
import { UAParser } from 'ua-parser-js';

function emptyStringToNull(value: any) {
  return value === '' ? null : value
}

export default defineEventHandler(async (event) => {
  const method = event.req.method

  if (method === 'GET') {
    const { profile_id } = getQuery(event)
    let query = supabase.from('logs').select('*').order('created_at', { ascending: true })

    if (profile_id) {
      query = query.eq('profile_id', profile_id as string)
    }

    const { data, error } = await query
    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  if (method === 'POST') {
    const body = await readBody(event)
    let { title, profile_id, type, is_master } = body

    if (!profile_id) {
      throw createError({ statusCode: 400, statusMessage: 'profile_id is required' })
    }
    if (!title) {
      throw createError({ statusCode: 400, statusMessage: 'title is required' })
    }

    let is_master_end = false;
    if(is_master) {
      is_master_end = is_master
    }

    // Sanitização
    title = emptyStringToNull(title)
    type = emptyStringToNull(type)

    // --- Captura extra de dados ---
    const ip = event.req.headers['x-forwarded-for']?.toString().split(',')[0] || event.req.socket.remoteAddress || null
    const userAgentString = event.req.headers['user-agent'] || null
    const parser = new UAParser(userAgentString as string)
    const ua = parser.getResult()

    const url = getRequestURL(event).href // URL completa

    const description = `${title} no dia ${new Date().toLocaleString('pt-BR')}. ` +
    `Feito pelo IP ${ip || 'desconhecido'}, ` +
    `navegador ${ua.browser.name || 'desconhecido'} ${ua.browser.version || ''}, ` +
    `URL ${url}`

    const { data, error } = await supabase
      .from('logs')
      .insert([{
        title,
        description,
        profile_id,
        type,
        ip_address: ip,
        user_agent: userAgentString,
        browser: ua.browser.name || null,
        os: ua.os.name || null,
        url,
        is_master: is_master_end
      }])
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, statusMessage: error.message })
    }
    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})

