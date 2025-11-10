import supabase from '../../utils/supabase' // O seu cliente Supabase (provavelmente com a service_role)

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }

  // --- INÍCIO DA VERIFICAÇÃO DE SEGURANÇA ---

  // 1. Pega o "Authorization: Bearer <token>" do header
  const authHeader = event.node.req.headers['authorization']
  
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Nenhum token fornecido' })
  }

  // 2. Isola o token (remove o "Bearer ")
  const token = authHeader.split(' ')[1]
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Token mal formatado' })
  }

  // 3. Pergunta ao Supabase quem é o dono desse token
  //    (VOCÊ PRECISA DO SEU CLIENTE SUPABASE AQUI)
  const { data: { user: userFromToken }, error: tokenError } = await supabase.auth.getUser(token)

  if (tokenError || !userFromToken) {
    throw createError({ statusCode: 401, statusMessage: 'Token inválido ou expirado' })
  }

  // 4. ESTE É O ID SEGURO!
  const authenticatedUserId = userFromToken.id

  // --- FIM DA VERIFICAÇÃO DE SEGURANÇA ---


  // 5. Agora sim, lemos o body, mas IGNORAMOS o 'user_id' que possa vir dele
  const { name, email } = await readBody(event)

  if (!name || !email) {
    throw createError({ statusCode: 400, statusMessage: 'Nome e Email são obrigatórios' })
  }

  // 6. Usamos o ID SEGURO (authenticatedUserId)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: authenticatedUserId, name, email }]) // <-- USANDO O ID SEGURO
    .select()
    .single()

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: profileError.message })
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert([
      { 
        name, 
        email, 
        profile_id: profile.id, // <-- ID Seguro (vindo do profile)
      }
    ])

  if (userError) {
    throw createError({ statusCode: 500, statusMessage: userError.message })
  }

  return {
    message: 'Usuário criado com sucesso',
    profile: profile,
    user: user
  }
})