<script setup lang="ts">
    import { useParams } from '../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const isCreateNewModal = ref<boolean>(false)
    const isNewModal = ref<boolean>(false)
    const monthsIndex = ref<number>(0);
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
    const changeMonthsIndex = (type: string) => {
        if(type === `max`) {
            monthsIndex.value++
        } else {
            monthsIndex.value--
        }
        if(monthsIndex.value < 0) {
            monthsIndex.value = 11
        } else if(monthsIndex.value > 11) {
            monthsIndex.value = 0
        }
    }

    onBeforeMount(() => {
        params.changeRouteCurrent('configuracao')
    })
</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Configuração</h2>
            </div>

            <div class="col-span-1 mt-6">
                <div class="grid grid-cols-1">
                    <div class="col-span-1">
                        <h2 class="text-xl font-[600]">Coisas que ainda vou fazer:</h2>
                    </div>
                    <div class="col-span-1 mt-4">
                        <ul class="flex flex-col">
                            <li>dldldl</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <CreateNewModal v-model="isCreateNewModal" />
    <NewModal v-model="isNewModal" newId="12344" />
</template>
