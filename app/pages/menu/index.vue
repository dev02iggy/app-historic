<script setup lang="ts">
    import { useParams } from '../../stores/params.js'; // Mantido do seu <script>
    import { useAuthentication } from '../../stores/authentication';
    const params = useParams();
    const authStore = useAuthentication();

    // 1. Define o layout que será usado
    definePageMeta({
        layout: 'dashboard'
    })

    // 2. Adiciona a função 'navigation' (copiada do seu layout)
    const router = useRouter()
    const navigation = (url: string) => {
        router.push(url)
    }

    // 3. Define o título da página (modificado do seu 'onBeforeMount')
    onBeforeMount(() => {
        params.changeRouteCurrent('menu') // <-- Mudei o nome
    })

    // 4. Removemos toda a lógica de 'getNotes', 'loading', 'months', etc.
</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">
            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Menu Principal</h2>
            </div>

            <div class="col-span-1 mt-6">
                <div class="flex flex-wrap justify-center items-center p-4 bg-gray-100 rounded-lg shadow-inner">
                    
                    <ButtonIcon 
                        @click="navigation(`/notas`)" 
                        icon="mdi:newspaper" 
                        label="Notas" 
                        color="border-gray-500 border-1" 
                        class="m-2" 
                    />
                    <ButtonIcon 
                        @click="navigation(`/tarefas`)" 
                        icon="mdi:clipboard-check" 
                        label="Tarefas" 
                        color="border-gray-500 border-1" 
                        class="m-2" 
                    />
                    <ButtonIcon 
                        @click="navigation(`/roadmaps`)" 
                        icon="mdi:road" 
                        label="Roadmaps" 
                        color="border-gray-500 border-1" 
                        class="m-2" 
                    />
                    <ButtonIcon 
                        @click="navigation(`/links`)" 
                        icon="mdi:link" 
                        label="Links" 
                        color="border-gray-500 border-1" 
                        class="m-2" 
                    />

                </div>
            </div>
        </div>
    </main>
    
    </template>