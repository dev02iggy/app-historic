<script setup lang="ts">
import { useAuthentication } from '../app/stores/authentication';
import { storeToRefs } from 'pinia';

// --- 1. INICIALIZAÇÃO ---
const { $supabase } = useNuxtApp();
const authStore = useAuthentication();
const router = useRouter();
const route = useRoute();

// Precisamos de 'storeToRefs' para manter a reatividade do getter
const { isLoggedIn } = storeToRefs(authStore);

// Flag CRÍTICA: Não podemos redirecionar antes de
// sabermos o status de login.
const authReady = ref(false);


// --- 2. O LISTENER DE AUTENTICAÇÃO ---
// 'onMounted' garante que isso só rode no CLIENTE,
// onde o Supabase pode checar o storage.
onMounted(() => {
  // 'onAuthStateChanged' é o "espião" do Supabase.
  // Ele roda na carga inicial e sempre que o auth mudar (login/logout).
  $supabase.auth.onAuthStateChange(async (event, session) => {
    
    if (session && session.user) {
      // USUÁRIO LOGADO
      // Chamamos a ação que busca o usuário E o perfil
      await authStore.fetchAndSetUser(session.user);
    } else {
      // USUÁRIO DESLOGADO
      authStore.clearAuth();
    }
    
    // Agora sabemos o status de auth. Podemos permitir os redirects.
    authReady.value = true;
  });
});


// --- 3. A LÓGICA DE REDIRECIONAMENTO (O "GUARDA") ---
// Usamos 'watch' para rodar a lógica sempre que a rota mudar
// ou o status de login mudar (após 'authReady' ser true).
watch([isLoggedIn, () => route.path, authReady], ([loggedIn, path, ready]) => {
  // Se o listener do Supabase ainda não rodou, não faça nada.
  if (!ready) {
    return;
  }
  
  // Define quais são as páginas "públicas" (de autenticação)
  const isAuthPage = path === '/' || path === '/cadastrar';

  // Lógica 1: Se o usuário ESTÁ LOGADO e tenta acessar
  // uma página pública (Login/Cadastro), jogue ele para /notas.
  if (loggedIn && isAuthPage) {
    router.push('/notas');
  }

  // Lógica 2: Se o usuário NÃO ESTÁ LOGADO e tenta
  // acessar uma página protegida, jogue ele para o Login (/).
  if (!loggedIn && !isAuthPage) {
    router.push('/');
  }

}, {
  immediate: true // Roda o 'watch' imediatamente na carga
});

</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <NuxtNotifications position="top right" :speed="500" />
</template>