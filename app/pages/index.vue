<script setup lang="ts">
    const router = useRouter();
    const isLoginModal = ref<boolean>(false);
    const { notify } = useNotification();
    const formdata = ref<any>({
        email: null,
        password: null
    })
    const login = () => {
        router.push('/menu')
        return
        const email = formdata.value.email;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email) {
            notify({
                title: "Erro ao logar:",
                text: "O e-mail precisa ser definido!",
                type: 'error'
            });
            return;
        }

        if (!emailRegex.test(email)) {
            notify({
                title: "E-mail inválido:",
                text: "Por favor, digite um e-mail com formato válido (ex: email@dominio.com)",
                type: 'error'
            });
            return;
        }

        isLoginModal.value = true;
    }
    const goRouter = (url: string) => {
        router.push(url)
    }
</script>
<template>
    <main class="container">
        <div class="grid grid-cols">
            <div class="col-span-1">
                <h1>Efetuar o login</h1>
            </div>
            <div class="col-span-1 mt-4">
                <form action="" class="grid grid-cols">
                    <div class="col-span-1">
                        <div class="flex flex-col relative mt-1">
                            <label v-if="formdata.email" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">E-mail:</label>
                            <input v-model="formdata.email" type="email" name="" id="" placeholder="E-mail" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                        </div>
                    </div>
                    <div class="col-span-1 mt-4">
                        <div class="flex items-center justify-end">
                            <Button label="Redefinir senha" color="bg-gray-600" class="mr-3" />
                            <Button @click.prevent="login" label="Entrar" color="bg-green-700" />
                        </div>
                        <div class="flex justify-center mt-2">
                            <Button @click.prevent="goRouter(`/cadastrar`)" label="Cadastrar-me" :isFlat="false" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </main>
    <LoginModal v-model="isLoginModal" :email="formdata.email" />
</template>