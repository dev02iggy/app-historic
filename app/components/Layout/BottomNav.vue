<script setup lang="ts">
const router = useRouter();
const navigation = (url: string) => {
    router.push(url)
}

// Links principais que aparecerão no rodapé
const navLinks = ref([
    { label: 'Notas', icon: 'mdi:newspaper', url: '/notas' },
    { label: 'Tarefas', icon: 'mdi:clipboard-check', url: '/tarefas' },
    { label: 'Roadmaps', icon: 'mdi:road', url: '/roadmaps' },
    { label: 'Links', icon: 'mdi:link', url: '/links' },
])
</script>

<template>
    <!-- 
      Esta 'nav' fica fixa no rodapé (fixed bottom-0)
      e aparece em cima de tudo (z-50).
    -->
    <nav class="fixed bottom-0 left-0 right-0 h-16 bg-gray-600 text-white shadow-lg z-50 lg:hidden">
        <!-- Usamos 'justify-around' para espaçar os botões igualmente -->
        <div class="flex justify-around items-center h-full">
            
            <!-- 
              Para cada link, criamos um botão de navegação.
              É melhor que o ButtonIcon, pois tem o ícone EM CIMA do texto.
            -->
            <button 
                v-for="link in navLinks" 
                :key="link.url" 
                @click="navigation(link.url)"
                class="flex flex-col items-center justify-center p-2 rounded-lg"
            >
                <!-- (Você precisa ter o <Icon /> da biblioteca nuxt-icon ou similar) -->
                <Icon :name="link.icon" class="text-2xl" />
                <span class="text-xs mt-1">{{ link.label }}</span>
            </button>

        </div>
    </nav>
</template>