<script setup lang="ts">
    import { useParams } from '../../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const isCreateNewNote = ref<boolean>(false)
    const isNewNote = ref<boolean>(false);
    const notes = ref<any[]>([]);
    const loading = ref<boolean>(true);
    const monthsIndex = ref<number>(0);
    const today = new Date();
    const selectedYear = ref(today.getFullYear());
    const selectedMonth = ref(today.getMonth() + 1); // +1 porque JS é 0-11
    const months: any = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ];
    const selectedMonthFormatted = computed(() => {
        return months[selectedMonth.value - 1]
    })
    const changeMonthsIndex = (type: string) => {
        if(type === `max`) {
            selectedMonth.value++
        } else {
            selectedMonth.value--
        }
        if(selectedMonth.value < 1) {
            selectedMonth.value = 12
            selectedYear.value--
        } else if(selectedMonth.value > 12) {
            selectedMonth.value = 1
            selectedYear.value++
        }
    }

    const getNotes = async () => {
        loading.value = true // Liga o loading a cada nova busca
        try {
            // Pega os valores atuais dos refs
            const year = selectedYear.value
            const month = selectedMonth.value

            // Constrói a URL com os query parameters
            const url = `/api/notes?year=${year}&month=${month}`
            
            const response = await fetch(url)
            const data = await response.json()
            notes.value = data
        } catch (error) {
            console.error('Erro ao buscar notas:', error)
        } finally {
            loading.value = false
        }
    }

    watch(selectedMonth, () => {
        getNotes()
    })

    /*const getDate = () => {
        const date = new Date()
    }*/

    onBeforeMount(() => {
        params.changeRouteCurrent('novidades')
    })

    onMounted(() => {
        getNotes()
    })
</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Notas</h2>
            </div>

            <div class="col-span-1 mt-6">
                <div class="grid grid-cols-1">
                    <div class="col-span-1">
                        <div class="flex justify-center items-center">
                            <Button @click="isCreateNewNote = true" label="Criar nota" color="bg-green-700 text-white" />
                        </div>
                    </div>
                    <div v-if="!loading" class="col-span-1 mt-4">
                        <div class="grid grid-cols-1 bg-gray-100 p-3">
                            <div class="col-span-1">
                                <div class="flex items-center justify-center">
                                    <ButtonIcon @click="changeMonthsIndex(`min`)" icon="mdi:arrow-left-thin" iconClass="text-5xl" />
                                    <div :class="`${notes.length > 0 ? 'bg-green-300' : 'bg-red-300'}`" class="mx-2 text-sm font-[500] flex justify-center py-1 w-[120px]"><span>{{ selectedMonthFormatted }}/{{ selectedYear }}</span></div>
                                    <ButtonIcon @click="changeMonthsIndex(`max`)" icon="mdi:arrow-right-thin" />
                                </div>
                            </div>
                            <div class="col-span-1 mt-4">
                                <div class="grid grid-cols-1">
                                    <div v-if="notes.length > 0" class="col-span-1">
                                        <div class="grid grid-cols-1 gap-4">
                                            <template v-for="note in notes" :key="note.id">
                                                <NuxtLink :to="`/notas/${note.id}`" class="cursor-pointer col-span-1 p-2 shadow bg-white rounded">
                                                    <div class="flex flex-col">
                                                        <div class="flex items-center justify-between">
                                                            <span class="text-sm mb-1 font-[600]">{{ note.title }}</span>
                                                            <span class="text-[0.8rem] mb-1 font-[600]">{{ note.created_at_formatted }}</span>
                                                        </div>
                                                        <p class="text-sm mb-1">{{ note.details }}</p>
                                                    </div>
                                                </NuxtLink>
                                            </template>
                                        </div>
                                    </div>
                                    <div v-else class="col-span-1">
                                        <span class="font-[600]">Nenhuma nota foi encontrada</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <CreateNewNote v-model="isCreateNewNote" @created="getNotes" />
</template>
