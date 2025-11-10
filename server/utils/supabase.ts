// server/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = useRuntimeConfig().public.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = useRuntimeConfig().SUPABASE_SERVICE_ROLE_KEY
//console.log(SUPABASE_URL)
//console.log(SUPABASE_SERVICE_ROLE_KEY)

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY! // use a chave secreta do Supabase
)

export default supabase
