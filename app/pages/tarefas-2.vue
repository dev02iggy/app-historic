<script setup lang="ts">
    import { useParams } from '../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const isTaskModal = ref<boolean>(false)
    const isCreateNewTask = ref<boolean>(false)
    const tasks = ref<any[]>([])
    const loading = ref<boolean>(true)

    const goRouter = (id: number) => {
        router.push(`/grupo/${id}`)
    }

    const layoutsOfCard: any = {
        small: {
            title: `text-[1rem]`,
            description: `text-[0.9rem]`,
            notes: `text-[0.75rem]`
        },
        medium: {
            title: `text-[1.1rem]`,
            description: `text-[1rem]`,
            notes: `text-[0.8rem]`
        },
        large: {
            title: `text-[1.15rem]`,
            description: `text-[1.05rem]`,
            notes: `text-[0.85rem]`
        },
        extralarge: {
            title: `text-[1.3rem]`,
            description: `text-[1.15rem]`,
            notes: `text-[0.9rem]`
        }
    }

    // Estilos adicionais por layout
    const layoutHeights: any = {
        small: 'min-h-[250px]',
        medium: 'min-h-[300px]',
        large: 'min-h-[350px]',
        extralarge: 'min-h-[400px]'
    }

    const layoutPadding: any = {
        small: 'p-3',
        medium: 'p-3',
        large: 'p-4',
        extralarge: 'p-4'
    }

    const layoutGap: any = {
        small: 'gap-2',
        medium: 'gap-2',
        large: 'gap-3',
        extralarge: 'gap-3'
    }

    const groupTitleSizes: any = {
        small: 'text-base',
        medium: 'text-lg',
        large: 'text-xl',
        extralarge: 'text-2xl'
    }

    const groups: any = [
        {
            id: 1,
            title: `Muito Urgente`,
            data: [1, 2],
            layout: `extralarge`
        },
        {
            id: 2,
            title: `Urgente`,
            data: [1],
            layout: `large`
        },
        {
            id: 3,
            title: `Pouco urgente`,
            data: [1, 2, 3, 4],
            layout: `medium`
        },
        {
            id: 4,
            title: `Nada urgente`,
            data: [1, 2],
            layout: `small`
        }
    ]

    const getTasks = async () => {
        try {
            const response = await fetch(`/api/tasks`);
            const data = await response.json();
            tasks.value = data;
            loading.value = false;
        } catch(error) {
            console.log(error)
        }
    }

    onBeforeMount(() => {
        params.changeRouteCurrent('tarefas')
    })
</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Grupos</h2>
            </div>
            <div class="col-span-1 mt-4">
                <div class="flex justify-center items-center">
                    <Button @click="isCreateNewTask = true" label="Criar tarefa" color="bg-green-700 text-white" />
                </div>
            </div>
            <div class="col-span-1 mt-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    <template v-for="group in groups" :key="group.id">
                        <div
                            :class="[
                                'col-span-1 shadow-lg bg-gray-200 rounded overflow-hidden transition-all duration-300 flex flex-col',
                                layoutHeights[group.layout]
                            ]"
                        >
                            <!-- Cabeçalho -->
                            <div class="bg-gray-600 text-white">
                                <div class="flex items-center justify-center p-2">
                                    <h2 :class="[groupTitleSizes[group.layout], 'font-bold']">{{ group.title }}</h2>
                                </div>
                            </div>

                            <!-- Conteúdo -->
                            <div :class="['bg-gray-200 flex-1', layoutPadding[group.layout]]">
                                <div :class="['grid grid-cols-1', layoutGap[group.layout]]">
                                    <template v-for="card in group.data" :key="card.id">
                                    <div @click="isTaskModal = true" role="dialog" tabindex="0" class="cursor-pointer bg-white p-2 rounded shadow-xl relative">
                                        <div class="flex flex-col">
                                            <span :class="layoutsOfCard[group.layout].title" class="font-[600]">Título</span>
                                            <p :class="layoutsOfCard[group.layout].description">Descrição</p>
                                            <div class="flex justify-between items-center mt-2">
                                                <span :class="layoutsOfCard[group.layout].notes" class="font-[500]">nota</span>
                                                <span :class="layoutsOfCard[group.layout].notes" class="font-[300]">faltam 22 dias</span>
                                            </div>
                                        </div>
                                        <button @click="isTaskModal = true" class="absolute top-[5px] right-[5px]"><Icon name="mdi:file-search" /></button>
                                    </div>
                                    </template>
                                    <!-- Você pode repetir cards se quiser simular mais dados -->
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </main>
    <TaskModal v-model="isTaskModal" />
    <CreateNewTask v-model="isCreateNewTask" @create="getTasks" />
</template>
