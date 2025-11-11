<script setup lang="ts">
    import { useParams } from '../../../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const note = ref<any>({})
    const loading = ref<boolean>(true)
    const route = useRoute();

    const noteId = computed<any>(() => {
        return route.params.noteId
    })

    const getNote = async () => {
        
        try {
            const response = await fetch(`/api/notes/${noteId.value}`)
            const data = await response.json();
            note.value = data;
            loading.value = false;
        } catch(error) {
            console.log(error)
        }
    }

    onBeforeMount(() => {
        params.changeRouteCurrent('notes')
    })

    onMounted(() => {
        getNote()
    })

</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols-1">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Nota</h2>
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
                                <div class="mx-auto bg-white p-2">
                                    <h2 class="text-center text-2xl font-[600]">
                                        {{ note.title }}
                                    </h2>
                                    <p class="text-center">
                                        {{ note.details }}
                                    </p>
                                    <p class="text-center text-[0.8rem] font-[500]">
                                        Criado em {{ note.created_at_formatted }}
                                    </p>
                                </div>
                            </div>
                            <div class="col-span-1 mt-4 bg-white p-4">
                                <div class="grid grid-cols-1">
                                    <div class="col-span-1">
                                        <h2 class="font-[600] text-lg">Observações</h2>
                                        <p>{{ note.observations || 'Nenhuma observação fornecida.' }}</p>
                                    </div>
                                    <div class="col-span-1 mt-3">
                                        <h2 class="font-[600] text-lg">Impacto</h2>
                                        <p>{{ note.customer_impact || 'Nenhum impacto fornecido.' }}</p>
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
