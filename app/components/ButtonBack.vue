<script lang="ts">

    export default {
        setup() {
            const backToThePreviusPage = () => {
                window.history.back()
            }
            return {
                backToThePreviusPage,
            }
        }
    }
</script>
<template>
    <a @click.prevent="backToThePreviusPage" href="" class="bg-gray-600 text-white px-3 py-1 rounded-full flex justify-center items-center no-underline" style="z-index: 1000">
        <Icon name="material-symbols:arrow-back-rounded" class="text-2xl" />
        <span class="ml-1">Voltar</span>
    </a>
</template>
<style lang="scss" scoped>
</style>
