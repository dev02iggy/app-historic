import supabase from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  // Logout supabase
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { message: 'Logout realizado com sucesso' }
})
