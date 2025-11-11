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
    const isCreateNewRoadmapItem = ref<boolean>(false);

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

    // Na sua PÁGINA (onde está o <script setup>)
    const updateItem = async (itemId: any, type: string) => {

        try {
            const response = await fetch(`/api/roadmaps_items/updated/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                type
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao atualizar o item');
            }

            const data = await response.json();
            alert(data.message);
            
            getRoadmapItems()

        } catch (error) {
            console.error('Erro em updateItem:', error);
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
                                    <p class="text-center text-[0.8rem] font-[500] mt-1">
                                        Criado em {{ roadmap.created_at_formatted }}
                                    </p>
                                    <p class="text-center text-[0.8rem] font-[500] mt-2">
                                        <span class="text-[0.75rem] px-2 py-1 rounded" :class="`${checkDateStatus(roadmap.date_end_at_formatted)}`">Data final: <span class="font-[600]">{{ roadmap.date_end_at_formatted }}</span></span>
                                    </p>
                                </div>
                            </div>
                            <div class="col-span-1 mt-4">
                                <div class="flex justify-center items-center">
                                    <Button @click="isCreateNewRoadmapItem = true" label="Criar item" color="bg-green-700 text-white" />
                                </div>
                            </div>
                            <div class="col-span-1 mt-4">
                                <div class="grid grid-cols-1">
                                    <div v-if="roadmapItems.length > 0" class="col-span-1">
                                        <div class="grid grid-cols-1 gap-4 w-full max-w-[500px] mx-auto">
                                            <template v-for="(item, indice) in roadmapItems" :key="value">
                                                <div class="col-span-1 flex flex-col items-center">
                                                    <div role="dialog" tabindex="0" class="w-full cursor-pointer p-2 shadow bg-white rounded">
                                                        
                                                        <div class="flex flex-col">
                                                            <div class="flex items-center justify-between">
                                                                <span class="mb-1 font-[600]">{{ item.name }}</span>
                                                                <span class="text-[0.8rem] mb-1 font-[600] rounded">{{ item.planned_at_formatted }}</span>
                                                            </div>
                                                            <p class="text-sm mb-1">{{ item.description }}</p>
                                                            <p v-if="item.is_failured || item.is_finished || item.is_paused" class="text-sm mb-1 p-2" :class="`${item.is_failured && 'bg-red-100'} ${item.is_paused && 'bg-orange-100'} ${item.is_finished && 'bg-teal-100'}`">{{ item.objective }}</p>
                                                            <p v-else class="text-sm mb-1 p-2 bg-gray-100">{{ item.objective }}</p>
                                                            <div class="flex flex-col">
                                                                <span class="text-[0.75rem]">Foi criado na data: <span class="font-[600]">{{ item.created_at_formatted }}</span></span>
                                                                <template v-if="item.is_failured || item.is_finished || item.is_paused">
                                                                    <span v-if="item.finished_at_formatted" class="text-[0.75rem]">Foi finalizado na data: <span class="font-[600]">{{ item.finished_at_formatted }}</span></span>
                                                                    <span v-if="item.paused_at_formatted" class="text-[0.75rem]">Foi pausado na data: <span class="font-[600]">{{ item.paused_at_formatted }}</span></span>
                                                                    <span v-if="item.failured_at_formatted" class="text-[0.75rem]">Foi interrompido na data: <span class="font-[600]">{{ item.failured_at_formatted }}</span></span>
                                                                </template>
                                                            </div>
                                                        </div>

                                                        <div class="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                                                            
                                                                <button v-if="!item.is_finished && !item.is_failured" v-tippy="{ content: `Finalizar`}" @click.stop="updateItem(item.id, 'finished')" class="cursor-pointer flex items-center p-1 rounded-full text-green-600 hover:bg-green-100" title="Finalizar">
                                                                    <Icon name="mdi:check-circle-outline" class="text-xl" />
                                                                </button>
                                                                
                                                                <button v-if="!item.is_paused && !item.is_failured && !item.is_finished" v-tippy="{ content: `Pausar`}" @click.stop="updateItem(item.id, 'paused')" class="cursor-pointer flex items-center p-1 rounded-full text-orange-500 hover:bg-orange-100" title="Pausar">
                                                                    <Icon name="mdi:pause-circle-outline" class="text-xl" />
                                                                </button>
                                                                <!--<button v-else @click.stop="retomarItem(item.id)" class="cursor-pointer flex items-center p-1 rounded-full text-blue-500 hover:bg-blue-100" title="Retomar">
                                                                    <Icon name="mdi:play-circle-outline" class="text-xl" />
                                                                </button>-->

                                                                <button v-if="!item.is_failured && !item.is_finished" v-tippy="{ content: `Interromper`}" @click.stop="updateItem(item.id, 'failured')" class="cursor-pointer flex items-center p-1 rounded-full text-red-600 hover:bg-red-100" title="Interrompido (Falha)">
                                                                    <Icon name="mdi:alert-octagon-outline" class="text-xl" />
                                                                </button>

                                                        </div>

                                                    </div>
                                                    
                                                    <Icon v-if="indice < roadmapItems.length - 1" name="material-symbols:arrow-cool-down-rounded" class="text-2xl mt-2" />
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
    <CreateNewRoadmapItem v-model="isCreateNewRoadmapItem" @created="getRoadmapItems" :roadmapId="roadmapId" />
</template>
