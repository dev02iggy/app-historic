<script setup lang="ts">
    import { useParams } from '../../stores/params.js';
    const params = useParams();
    definePageMeta({
        layout: 'dashboard'
    })

    const router = useRouter()
    const isCreateNewLink = ref<boolean>(false)
    const isNewLink = ref<boolean>(false);
    const links = ref<any[]>([]);
    const loading = ref<boolean>(true);
    const selectedLink = ref<any>({});

    const getLinks = async () => {
        loading.value = true // Liga o loading a cada nova busca
        try {
            const url = `/api/links`
            
            const response = await fetch(url)
            const data = await response.json()
            links.value = data
        } catch (error) {
            console.error('Erro ao buscar links:', error)
        } finally {
            loading.value = false
        }
    }

    const openLink = (link: any) => {
        selectedLink.value = link;
        isCreateNewLink.value = true;
    }

    const openCreateLink = () => {
        selectedLink.value = null;
        isCreateNewLink.value = true;
    }

    /*const getDate = () => {
        const date = new Date()
    }*/

    onBeforeMount(() => {
        params.changeRouteCurrent('links')
    })

    onMounted(() => {
        getLinks()
    })
</script>

<template>
    <main class="container mx-auto">
        <div class="grid grid-cols">

            <div class="col-span-1 mt-4">
                <h2 class="text-center text-2xl font-[600]">Links</h2>
            </div>

            <div class="col-span-1 mt-6">
                <div class="grid grid-cols-1">
                    <div class="col-span-1">
                        <div class="flex justify-center items-center">
                            <Button @click="openCreateLink()" label="Criar link" color="bg-green-700 text-white" />
                        </div>
                    </div>
                    <div v-if="!loading" class="col-span-1 mt-4">
                        <div class="grid grid-cols-1 bg-gray-100 p-3">
                            <div class="col-span-1 mt-4">
                                <div class="grid grid-cols-1">
                                    <div v-if="links.length > 0" class="col-span-1">
                                        <div class="grid grid-cols-1 gap-4">
                                            <template v-for="link in links" :key="link.id">
                                                <div @click="openLink(link)" class="cursor-pointer col-span-1 p-2 shadow bg-white rounded">
                                                    <div class="flex flex-col">
                                                        <div class="flex items-center justify-between">
                                                            <span class="text-sm mb-1 font-[600]">{{ link.title }}</span>
                                                            <span class="text-[0.8rem] mb-1 font-[600]">{{ link.created_at_formatted }}</span>
                                                        </div>
                                                        <div class="flex items-center mb-1">
                                                            <span class="text-sm mr-3">{{ link.link }}</span>
                                                            
                                                            <a :href="link.link" target="_blank" rel="noopener noreferrer" @click.stop>
                                                                <Icon name="mdi:attachment" class="align-middle" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                    <div v-else class="col-span-1">
                                        <span class="font-[600]">Nenhum link foi encontrado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <CreateNewLink v-model="isCreateNewLink" @created="getLinks" :link="selectedLink" />
</template>
