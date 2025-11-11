<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { vMaska } from "maska/vue";

export default defineComponent({
  name: 'CreateNewNote',
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
    link: {
      type: Object,
      required: false
    }
  },
  directives: {
		maska: vMaska, // 👈 registra a diretiva
	},
  emits: ['update:modelValue', 'closed', 'created'],
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue);
    const link = ref(props.link);
    const router = useRouter();
    const formdata = ref<any>({
      title: null,
      description: null,
      link: null,
    })
    const closeModal = () => {
      isOpen.value = false;
      emit('update:modelValue', false);
      emit('closed');
    };

    // Acompanhar se o estado do modal for alterado fora
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
    });

    const initializeForm = (linkToLoad: any) => {
      if (linkToLoad && linkToLoad.id) {
        formdata.value = {
          title: linkToLoad.title,
          description: linkToLoad.description,
          link: linkToLoad.link,
        };

      } else {
        // --- MODO CRIAÇÃO ---
        formdata.value = {
          title: null,
          description: null,
          link: null,
        };
      }
    };

    watch(() => props.link, (newLink) => {
      link.value = newLink;
      initializeForm(newLink);
    }, {
      immediate: true
    });

    const createLink = async () => {
      const payload = {
          title: formdata.value.title,
          description: formdata.value.description,
          link: formdata.value.link,
      };
      
      try {
        const response = await fetch('/api/links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        alert(data.message)
        formdata.value = {
          title: null,
          description: null,
          link: null,
        }
        emit('created')
        emit('update:modelValue', false);
      } catch(error) {
        console.log(error)
      }
    }

    const updateLink = async () => {
      if (!link.value || !link.value.id) {
          console.error('Nenhuma tarefa para atualizar.');
          return;
      }
      const payload = {
          title: formdata.value.title,
          description: formdata.value.description,
          link: formdata.value.link,
      };
      try {
        const response = await fetch(`/api/links/${link.value.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        alert(data.message)
        formdata.value = {
          title: null,
          description: null,
          link: null,
        }
        emit('created')
        emit('update:modelValue', false);
      } catch(error) {
        console.log(error)
      }
    }

    const goRouter = () => {
      router.push(`/links`)
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
      goRouter,
      formdata,
      link,
      createLink,
      updateLink
    };
  },
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed px-2 inset-0 bg-black/50 bg-opacity-50 z-100 flex justify-center items-center"
    @click="handleBackdropClick"
  >
    <div
      class="w-[600px] bg-white rounded-lg shadow-lg p-[30px] relative max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Cabeçalho do modal -->
      <div class="text-xl font-semibold mb-2">{{ link?.id ? 'Editar' : 'Criar' }} link</div>

      <!-- Conteúdo rolável do modal -->
      <div class="overflow-y-auto flex-1">
        <div class="grid grid-cols py-4">
          <div class="col-span-1">
            <div class="grid grid-cols-1">

              <div class="col-span-1">
                <form action="" class="grid grid-cols-1">
                  <div class="col-span-1">
                    <div class="flex flex-col relative mt-1">
                        <label v-if="formdata.title" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Título:</label>
                        <input v-model="formdata.title" type="text" name="" id="" placeholder="Título" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                    </div>
                  </div>
                  <div class="col-span-1 mt-1">
                    <div class="flex flex-col relative mt-1">
                        <label v-if="formdata.description" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Descrição:</label>
                        <textarea v-model="formdata.description" rows="4" name="" id="" placeholder="Descrição" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1" />
                    </div>
                  </div>
                  <div class="col-span-1 mt-1">
                    <div class="flex flex-col relative mt-1">
                        <label v-if="formdata.link" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Link:</label>
                        <input v-model="formdata.link" type="text" name="" id="" placeholder="Link" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                    </div>
                  </div>
                  <div class="col-span-1 mt-4">
                    <div class="flex items-center justify-end">
                      <Button v-if="!link?.id" @click.prevent="createLink" label="Criar" color="bg-green-700" />
                      <Button v-else @click.prevent="updateLink" label="Salvar" color="bg-green-700" />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão de Fechar -->
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