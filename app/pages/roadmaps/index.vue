<script setup lang="ts">
    import { useParams } from '../../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const isCreateNewRoadmap = ref<boolean>(false)
    const isNewModal = ref<boolean>(false)
    const roadmaps = ref<any[]>([])
    const loading = ref<boolean>(true)

    const getRoadmaps = async () => {
        try {
            const response = await fetch(`/api/roadmaps`);
            const data = await response.json();
            roadmaps.value = data;
            console.log(data)
            loading.value = false;
        } catch(error) {
            console.log(error)
        }
    }

    const checkDateStatus = (supabaseTimestamp: any) => {
        if (!supabaseTimestamp) {
            return '';
        }
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const targetDate = new Date(supabaseTimestamp);
        targetDate.setHours(0, 0, 0, 0);
        // 3. Calcula a diferença em milissegundos
        const diffMs = targetDate.getTime() - now.getTime();

        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.round(diffMs / msPerDay);

        if (diffDays <= 0) {
            // Se a diferença for 0 (hoje) ou negativa (passado)
            return 'bg-red-300';
        } 
        else if (diffDays <= 7) {
            // Se for entre 1 e 7 dias no futuro
            return 'bg-red-100';
        } 
        else {
            // Se for mais de 7 dias no futuro
            return 'bg-orange-300';
        }
    }

    onBeforeMount(() => {
        params.changeRouteCurrent('roadmaps')
    })

    onMounted(() => {
        getRoadmaps()
    })
</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Roadmaps</h2>
            </div>

            <div class="col-span-1 mt-6">
                <div v-if="!loading" class="grid grid-cols-1">
                    <div class="col-span-1">
                        <div class="flex justify-center items-center">
                            <Button @click="isCreateNewRoadmap = true" label="Criar roadmap" color="bg-green-700 text-white" />
                        </div>
                    </div>
                    <div class="col-span-1 mt-4 bg-gray-100 rounded p-4">
                        <div class="grid grid-cols-1 gap-4">
                            <template v-for="roadmap in roadmaps" :key="value">
                                <NuxtLink :to="`/roadmaps/${roadmap.id}`" class="cursor-pointer col-span-1 p-2 shadow bg-white rounded">
                                    <div class="flex flex-col">
                                        <div class="flex items-center justify-between">
                                            <span class="mb-1 font-[600]">{{ roadmap.name }}</span>
                                            <span class="text-[0.7rem] mb-1 font-[600]">Criado em {{ roadmap.created_at_formatted }}</span>
                                        </div>
                                        <p class="text-sm mb-1">{{ roadmap.description }}</p>
                                        <!--<div class="flex">
                                            <span class="bg-red-600 text-white text-[0.8rem]" style="padding: 1px 10px;">Importância</span>
                                        </div>-->
                                        <div v-if="roadmap.updated_at" class="flex flex-col">
                                            <span class="text-[0.75rem]">Última vez atualizado: <span class="font-[600]">{{ roadmap.updated_at_formatted }}</span></span>
                                        </div>
                                        <div v-if="roadmap.date_end_at" class="flex flex-col items-start mt-1">
                                            <span class="text-[0.75rem] px-2 py-1 rounded" :class="`${checkDateStatus(roadmap.date_end_at_formatted)}`">Data final: <span class="font-[600]">{{ roadmap.date_end_at_formatted }}</span></span>
                                        </div>
                                    </div>
                                </NuxtLink>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <CreateNewRoadmap v-model="isCreateNewRoadmap" @created="getRoadmaps" />
</template>
