<script setup lang="ts">
    import { useParams } from '../../../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const roadmapItems = ref<any[]>([])
    const roadmap = ref<any>({})
    const loading = ref<boolean>(true)
    const route = useRoute();

    const roadmapId = computed<any>(() => {
        return route.params.roadmapId
    })

    const getRoadmapItems = async () => {
        try {
            const response = await fetch(`/api/roadmaps_items?roadmap_id=${roadmapId.value}`);
            const data = await response.json();
            if(!data.error) {
                roadmapItems.value = data;
            }
            loading.value = false;
        } catch(error) {
            console.log(error)
        }
    }

    const getRoadmap = async () => {
        try {
            const response = await fetch(`/api/roadmaps/${roadmapId.value}`)
            const data = await response.json();
            roadmap.value = data;
            getRoadmapItems()
        } catch(error) {
            console.log(error)
        }
    }

    onBeforeMount(() => {
        params.changeRouteCurrent('roadmaps')
    })

    onMounted(() => {
        getRoadmap()
    })

</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Roadmap</h2>
            </div>

            <div class="col-span-1 mt-6">
                <div v-if="!loading" class="grid grid-cols-1">
                    <div class="col-span-1">
                        <div class="flex justify-center items-center">
                            <ButtonBack />
                        </div>
                    </div>
                    <div class="col-span-1 mt-4">
                        <div class="grid grid-cols-1 bg-gray-100 p-4 rounded">
                            <div class="col-span-1">
                                <div class="mx-auto max-w-[700px] bg-white p-2">
                                    <h2 class="text-center text-2xl font-[600]">
                                        {{ roadmap.name }}
                                    </h2>
                                    <p class="text-center">
                                        {{ roadmap.description }}
                                    </p>
                                </div>
                            </div>
                            <div class="col-span-1 mt-4">
                                <div class="grid grid-cols-1">
                                    <div v-if="roadmapItems.length > 0" class="col-span-1">
                                        <div class="grid grid-cols-1 gap-4 w-full max-w-[500px] mx-auto">
                                            <template v-for="item in roadmapItems" :key="value">
                                                <div class="col-span-1 flex flex-col items-center">
                                                    <div role="dialog" tabindex="0" class="w-full cursor-pointer p-2 shadow bg-white rounded">
                                                        <div class="flex flex-col">
                                                            <div class="flex items-center justify-between">
                                                                <span class="mb-1 font-[600]">{{ item.name }}</span>
                                                                <span class="text-[0.8rem] mb-1 font-[600]">{{ item.planned_at }}</span>
                                                            </div>
                                                            <p class="text-sm mb-1">{{ item.description }}</p>
                                                            <p v-if="item.is_failure || item.is_finished || item.is_paused" class="text-sm mb-1 p-2" :class="`${item.is_failure && 'bg-red-100'} ${item.is_paused && 'bg-orange-100'} ${item.is_finished && 'bg-teal-100'}`">{{ item.objective }}</p>
                                                            <p v-else class="text-sm mb-1 p-2 bg-gray-100">{{ item.objective }}</p>
                                                            <!--<div class="flex">
                                                                <span class="bg-red-600 text-white text-[0.8rem]" style="padding: 1px 10px;">Importância</span>
                                                            </div>-->
                                                            <div class="flex flex-col">
                                                                <span class="text-[0.75rem]">Foi criado na data: <span class="font-[600]">{{ item.created_at }}</span></span>
                                                                <template v-if="item.is_failure || item.is_finished || item.is_paused">
                                                                    <span class="text-[0.75rem]">Foi finalizado na data: <span class="font-[600]">{{ item.finished_at }}</span></span>
                                                                    <span class="text-[0.75rem]">Foi pausado na data: <span class="font-[600]">{{ item.paused_at }}</span></span>
                                                                    <span class="text-[0.75rem]">Foi interrompido na data: <span class="font-[600]">{{ item.failure_at }}</span></span>
                                                                </template>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Icon name="material-symbols:arrow-cool-down-rounded" class="text-2xl mt-2" />
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                    <div v-else class="col-span-1">
                                        <div class="flex justify-center">
                                            <span class="font-[600]">Nenhum item foi encontrado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>
