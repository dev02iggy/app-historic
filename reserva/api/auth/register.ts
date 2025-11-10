import supabase from '@/server/utils/supabase'

function generateToken(length = 10): string {
  const lettersNumbers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const specialChars = '!@#$%^*_-';

  let tokenArray = []

  // 1. Garante no mínimo 1 e no máximo 2 caracteres especiais
  const numSpecialChars = Math.floor(Math.random() * 2) + 1  // 1 ou 2

  // Insere os especiais
  for (let i = 0; i < numSpecialChars; i++) {
    tokenArray.push(specialChars.charAt(Math.floor(Math.random() * specialChars.length)))
  }

  // Insere o restante com letras e números (length - numSpecialChars)
  for (let i = 0; i < length - numSpecialChars; i++) {
    tokenArray.push(lettersNumbers.charAt(Math.floor(Math.random() * lettersNumbers.length)))
  }

  // Embaralha o array para distribuir os especiais aleatoriamente
  for (let i = tokenArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[tokenArray[i], tokenArray[j]] = [tokenArray[j], tokenArray[i]]
  }

  return tokenArray.join('')
}


export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
  }
  const token = generateToken()
  const { name, email, password, type } = await readBody(event)

  if (!name || !email || !password || !type) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  // Cria usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    throw createError({ statusCode: 500, statusMessage: authError.message })
  }

  // Cria perfil na tabela 'profiles'
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([{ id: authData.user.id, name, email, type }])
    .select()
    .single()

  if (profileError) {
    throw createError({ statusCode: 500, statusMessage: profileError.message })
  }

  // Dependendo do tipo, cria um registro em companies ou candidates
  if (type === 'company') {
    if (type === 'company') {
      // Cria a empresa
      let representative_email = email;
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert([{ name, email, representative_email, profile_id: profile.id, code_confirmation: token }])
        .select()
        .single()  // pegamos o company criado para usar o id

      if (companyError) {
        throw createError({ statusCode: 500, statusMessage: companyError.message })
      }

      // Cria a configuração associada à empresa criada
      const { error: configError } = await supabase
        .from('configurations')
        .insert([{ company_id: company.id }])

      if (configError) {
        throw createError({ statusCode: 500, statusMessage: configError.message })
      }
    }
  } 
  else if (type === 'candidate') {
    const { error: candidateError } = await supabase
      .from('candidates')
      .insert([{ name, email, profile_id: profile.id, code_confirmation: token }])

    if (candidateError) {
      throw createError({ statusCode: 500, statusMessage: candidateError.message })
    }
  }
  else if (type === 'admin') {
    const { error: adminError } = await supabase
      .from('admins')
      .insert([{ name, email, profile_id: profile.id, code_confirmation: token }])

    if (adminError) {
      throw createError({ statusCode: 500, statusMessage: adminError.message })
    }
  }

  return {
    ...profile,
    token
  }
})

