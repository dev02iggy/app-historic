<script setup lang="ts">
const router = useRouter();
const navigation = (url: string) => {
    router.push(url)
}
</script>

<template>
    <!-- 
      Este header é mostrado em telas pequenas e escondido em 'lg'
      Tem sombra, altura e cor, assim como o original.
    -->
    <header class="h-16 bg-gray-600 shadow-md flex items-center justify-between px-4 text-white lg:hidden">
        <!-- Título -->
        <h1 class="text-lg font-bold">Gerenciador</h1>

        <!-- 
          No mobile, o header só tem os botões de "ação" (Config/Sair).
          Note que removemos a prop 'label' do ButtonIcon para economizar espaço.
        -->
        <div class="flex items-center space-x-2">
            <ButtonIcon @click="navigation(`/configuracao`)" icon="mdi:cog" color="border-white border-1" iconClass="" />
            <ButtonIcon @click="navigation(`/`)" icon="mdi:reply-outline" color="border-white border-1" iconClass="" />
        </div>
    </header>
</template>