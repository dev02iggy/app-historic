<script setup lang="ts">
    // (Seu script continua o mesmo)
    import { useParams } from '../stores/params.js';
    const { $supabase } = useNuxtApp();

    const isModal = ref<boolean>(false);
    const router = useRouter();
    const params = useParams();

    const navigation = (url: string) => {
        router.push(url)
    }

    const logout = async () => {
        try {
            await $supabase.auth.signOut()
            router.push('/')
        } catch(error) {
            console.log(error)
        }
        
    }
</script>

<template>
    <div class="min-h-screen w-full bg-white flex flex-col">
        
        <!-- =================================== -->
        <!-- 1. HEADER (TOPO)                      -->
        <!-- =================================== -->

        <!-- HEADER DESKTOP (O seu original) -->
        <!-- Escondido em telas pequenas (hidden), mostrado em telas grandes (lg:flex) -->
        <header class="h-16 bg-gray-600 shadow-md hidden lg:flex items-center justify-between px-4 text-white">
            <h1 class="text-lg font-bold">Gerenciador</h1>
            <div class="flex items-center">
                <ButtonIcon @click="navigation(`/notas`)" icon="mdi:newspaper" label="Notas" color="border-white border-1" iconClass="" class="mr-3" />
                <ButtonIcon @click="navigation(`/tarefas`)" icon="mdi:clipboard-check" label="Tarefas" color="border-white border-1" iconClass="" class="mr-3" />
                <ButtonIcon @click="navigation(`/roadmaps`)" icon="mdi:road" label="Roadmaps" color="border-white border-1" iconClass="" class="mr-3" />
                <ButtonIcon @click="navigation(`/links`)" icon="mdi:link" label="Links" color="border-white border-1" iconClass="" class="mr-3" />
                <ButtonIcon @click="logout()" icon="mdi:reply-outline" label="Sair" color="border-white border-1" iconClass="" class="mr-3" />
                <ButtonIcon @click="navigation(`/configuracao`)" icon="mdi:cog" color="border-white border-1" iconClass="" />
            </div>
        </header>

        <!-- HEADER MOBILE (Novo Componente) -->
        <!-- Mostrado em telas pequenas, escondido em telas grandes (lg:hidden) -->
        <LayoutMobileHeader class="lg:hidden" />

        <!-- =================================== -->
        <!-- 2. CONTEÚDO (MAIN)                    -->
        <!-- =================================== -->
        
        <!-- 
          Mudança principal:
          Adicionamos 'pb-20' (padding-bottom) em telas pequenas
          para dar espaço para a barra de navegação fixa no rodapé.
          Em telas grandes ('lg:pb-4'), ele volta ao padding normal.
        -->
        <main class="flex-1 overflow-auto p-4 pb-20 lg:pb-4">
            <slot />
        </main>

        <!-- =================================== -->
        <!-- 3. RODAPÉ (FOOTER)                    -->
        <!-- =================================== -->

        <!-- FOOTER DESKTOP (O seu original) -->
        <!-- Escondido em telas pequenas, pois o mobile usará a nav bar -->
        <footer class="h-12 bg-gray-600 hidden lg:flex items-center justify-center text-sm text-white">
            © 2025
        </footer>

        <!-- NAV BAR MOBILE (Novo Componente) -->
        <!-- Fica fixo no rodapé em telas pequenas -->
        <LayoutBottomNav class="lg:hidden" />

    </div>
</template>