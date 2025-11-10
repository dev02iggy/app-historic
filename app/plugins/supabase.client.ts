import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const SUPABASE_URL = useRuntimeConfig().public.SUPABASE_URL
  const SUPABASE_ANON_KEY = useRuntimeConfig().public.SUPABASE_ANON_KEY
  //console.log(SUPABASE_URL)
  //console.log(SUPABASE_ANON_KEY)

  const supabase = createClient(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string
  )

  return {
    provide: {
      supabase
    }
  }
})
