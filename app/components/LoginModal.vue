<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { vMaska } from "maska/vue";

export default defineComponent({
  name: 'LoginModal',
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    closeOnBackdrop: {
      type: Boolean,
      required: false,
      default: true,
    },
    email: {
			type: String,
			required: false
		}
  },
  directives: {
		maska: vMaska, // 👈 registra a diretiva
	},
  emits: ['update:modelValue', 'closed'],
  setup(props, { emit }) {
    const { $supabase } = useNuxtApp();
    const { notify } = useNotification();
    const isOpen = ref(props.modelValue);
    const formdata = ref<any>({
      email: null,
      password: null
    })
    const isShowPassword = ref<boolean>(false)
    const router = useRouter();
    const closeModal = () => {
      isOpen.value = false;
      emit('update:modelValue', false);
      emit('closed');
    };

    // Acompanhar se o estado do modal for alterado fora
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
    });
    watch(() => props.email, (newVal) => {
			formdata.value.email = newVal;
		})

    const goRouter = () => {
      router.push(`/tarefas`)
    }

    const login = async () => {

      // 1. Validação da senha
      if (!formdata.value.password) {
        notify({
          title: "Erro ao logar:",
          text: "É preciso informar a senha!",
          type: 'error' // 👈 CORRIGIDO
        });
        return; // 👈 ADICIONADO: Para a função aqui
      }

      // 2. Validação do e-mail (Adicionada como boa prática)
      if (!formdata.value.email) {
        notify({
          title: "Erro ao logar:",
          text: "É preciso informar o e-mail!",
          type: 'error'
        });
        return; // 👈 ADICIONADO
      }

      try {
        const { data, error } = await $supabase.auth.signInWithPassword({
          email: formdata.value.email,
          password: formdata.value.password
        });

        if (error) {
          console.error("Erro no login:", error.message);
          notify({
            title: "Erro ao logar:",
            // Use a mensagem de erro real (ou uma genérica)
            text: error.message || "E-mail ou senha incorretos.",
            type: 'error' // 👈 CORRIGIDO
          });
        } else {
          // Sucesso!
          console.log("Login com sucesso!", data.user);
          notify({
            title: "Sucesso!",
            text: "Login realizado.",
            type: 'success'
          });
          // (Aqui você redirecionaria o usuário)
          router.push('/menu');
        }
      } catch (error) {
        // Pega qualquer outro erro inesperado
        console.log(error);
        notify({
          title: "Erro inesperado",
          text: "Não foi possível conectar.",
          type: 'error'
        });
      }
  }

    // Fechar se o usuário clicar fora do modal (em um fundo opaco)
    const handleBackdropClick = (e: MouseEvent) => {
      if (props.closeOnBackdrop && e.target === e.currentTarget) {
        closeModal();
      }
    };

    return {
      isOpen,
      closeModal,
      handleBackdropClick,
      formdata,
      goRouter,
      isShowPassword,
      login
    };
  },
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 bg-opacity-50 z-100 flex justify-center items-center"
    @click="handleBackdropClick"
  >
    <div
      class="w-[600px] bg-white rounded-lg shadow-lg p-[30px] relative max-h-[90vh] overflow-hidden flex flex-col"
    >
      <div class="text-xl font-semibold mb-4">Digite a sua senha</div>
      <div class="overflow-y-auto flex-1">
        <div class="grid grid-cols p-10">
          <div class="col-span-1">
            
            <form @submit.prevent="login" class="grid grid-cols">
                <div class="col-span-1">
                    <div class="flex flex-col relative mt-1">
                        <label v-if="formdata.password" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Senha:</label>
                       <div class="relative">
                          <input v-model="formdata.password" :type="isShowPassword ? 'text' : 'password'" name="" id="" placeholder="Senha" class="w-full mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                          
                          <button @click="isShowPassword = !isShowPassword" type="button" class="cursor-pointer absolute position-center-y right-[5px] p-0 "><Icon :name="isShowPassword ? 'material-symbols:visibility-lock-rounded' : 'material-symbols:visibility-rounded'" class="align-middle text-xl" /></button>
                       </div>
                    </div>
                </div>
                <div class="col-span-1 mt-4">
                    <div class="flex justify-center mt-2">
                        
                        <Button type="submit" label="Confirmar" color="bg-orange-600" />
                        
                    </div>
                </div>
            </form>
          </div>
        </div>
      </div>

      <button
        class="cursor-pointer absolute top-[10px] right-[10px] text-gray-600 hover:text-gray-900"
        @click="closeModal"
      >
      <Icon name="mdi:close" class="text-xl" />
    </button>
    </div>
  </div>
</template>

<style scoped>
/* Animação suave */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

div[v-cloak] {
  display: none;
}

div.fixed {
  animation: fadeIn 0.3s ease-in-out;
}
</style>