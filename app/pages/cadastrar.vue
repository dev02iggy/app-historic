<script setup lang="ts">
    import { ref } from 'vue';
    
    // 1. Pegamos o 'supabase' do seu plugin do Nuxt
    // Esta é a instância SEGURA do frontend (com anon_key)
    const { $supabase } = useNuxtApp();
    
    const router = useRouter()
    const isLoginModal = ref<boolean>(false)
    const formdata = ref<any>({
        name: null,
        email: null,
        password: null,
        passwordTwo: null
    })
    const isShowPassword = ref<boolean>(false)
    const isShowPasswordTwo = ref<boolean>(false)
    const isLoading = ref<boolean>(false); // Para desabilitar botões

    // --- ESTA É A FUNÇÃO 'send' COMPLETA ---
    const send = async () => {
        isLoading.value = true;
        
        // Validação 1: Senhas conferem?
        if (formdata.value.password !== formdata.value.passwordTwo) {
            alert('As senhas não conferem!');
            isLoading.value = false;
            return;
        }
        // Validação 2: Campos preenchidos?
        if (!formdata.value.email || !formdata.value.password || !formdata.value.name) {
            alert('Por favor, preencha todos os campos.');
            isLoading.value = false;
            return;
        }

        try {
            // --- Etapa 1: Chamar o Auth (Frontend) ---
            const { data: authData, error: authError } = await $supabase.auth.signUp({
                email: formdata.value.email,
                password: formdata.value.password,
            });

            if (authError) throw authError;

            // Caso 1: Confirmação de e-mail está ATIVADA
            if (!authData.session) {
                // O usuário foi criado, mas precisa confirmar o e-mail
                alert('Conta criada! Por favor, verifique seu e-mail para confirmar a conta antes de fazer o login.');
                isLoading.value = false;
                isLoginModal.value = true; // Abre o modal de login
                return;
            }

            // Caso 2: Confirmação de e-mail está DESATIVADA
            // O usuário foi criado E já está logado (tem uma sessão)
            // Agora podemos chamar o backend para criar o 'profile'

            // --- Etapa 2: Chamar nossa API de Backend ---
            const response = await fetch('/api/auth/register', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // ESSENCIAL: Envia o token para provar quem somos
                    'Authorization': `Bearer ${authData.session.access_token}` 
                },
                body: JSON.stringify({
                    name: formdata.value.name,
                    email: formdata.value.email
                    // Note que não enviamos o user_id, o backend pega do token
                })
            });

            if (!response.ok) {
                // Se o backend der erro (ex: 401, 500)
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao criar o perfil no backend.');
            }

            // --- Sucesso Total! ---
            alert('Conta criada com sucesso! Você já está logado.');
            goRouter(); // Navega para /tarefas

        } catch (error: any) {
            console.error('Erro no cadastro:', error);
            alert(error.message || 'Ocorreu um erro.');
        } finally {
            isLoading.value = false;
        }
    }
    
    const goRouter = () => {
        router.push(`/tarefas`)
    }
</script>

<template>
    <main class="container">
        <div class="grid grid-cols">
            <div class="col-span-1">
                <h1>Efetuar o cadastro</h1>
            </div>
            <div class="col-span-1 mt-4">
                <form action="" class="grid grid-cols">
                    <div class="col-span-1">
                        <div class="flex flex-col relative mt-1">
                            <label v-if="formdata.name" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Nome:</label>
                            <input v-model="formdata.name" type="text" name="" id="" placeholder="Nome" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                        </div>
                    </div>
                    <div class="col-span-1 mt-2">
                        <div class="flex flex-col relative mt-1">
                            <label v-if="formdata.email" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">E-mail:</label>
                            <input v-model="formdata.email" type="email" name="" id="" placeholder="E-mail" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                        </div>
                    </div>
                    <div class="col-span-1 mt-2">
                        <div class="flex flex-col relative mt-1">
                            <label v-if="formdata.password" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Senha:</label>
                        <div class="relative">
                            <input v-model="formdata.password" :type="isShowPassword ? 'text' : 'password'" name="" id="" placeholder="Senha" class="w-full mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                            <button @click="isShowPassword = !isShowPassword" type="button" class="cursor-pointer absolute position-center-y right-[5px] p-0 "><Icon :name="isShowPassword ? 'material-symbols:visibility-lock-rounded' : 'material-symbols:visibility-rounded'" class="align-middle text-xl" /></button>
                        </div>
                        </div>
                    </div>
                    <div class="col-span-1 mt-2">
                        <div class="flex flex-col relative mt-1">
                            <label v-if="formdata.passwordTwo" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Senha:</label>
                        <div class="relative">
                            <input v-model="formdata.passwordTwo" :type="isShowPasswordTwo ? 'text' : 'password'" name="" id="" placeholder="Senha" class="w-full mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                            <button @click="isShowPasswordTwo = !isShowPasswordTwo" type="button" class="cursor-pointer absolute position-center-y right-[5px] p-0 "><Icon :name="isShowPasswordTwo ? 'material-symbols:visibility-lock-rounded' : 'material-symbols:visibility-rounded'" class="align-middle text-xl" /></button>
                        </div>
                        </div>
                    </div>
                    <div class="col-span-1 mt-4">
                        <div class="flex items-center justify-end">
                            <!-- 
                                CORREÇÃO AQUI:
                                O botão "Cadastrar" deve chamar 'send()'
                            -->
                            <Button @click.prevent="send" label="Cadastrar" color="bg-green-700" :disabled="isLoading" />
                        </div>
                        <div class="flex justify-center mt-2">
                            <!-- 
                                CORREÇÃO AQUI:
                                O botão "Login" deve abrir o modal
                            -->
                            <Button @click.prevent="isLoginModal = true" label="Já tenho conta (Login)" :isFlat="false" :disabled="isLoading" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </main>
    <LoginModal v-model="isLoginModal" />
</template>