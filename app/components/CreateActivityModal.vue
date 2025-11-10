<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { vMaska } from "maska/vue";

export default defineComponent({
  name: 'CreateActivityModal',
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
    task: {
      type: Object,
      required: true
    }
  },
  directives: {
		maska: vMaska, // 👈 registra a diretiva
	},
  emits: ['update:modelValue', 'closed', 'created'],
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue);
    const task = ref(props.task)
    const router = useRouter();
    const selectedDate = ref<any>('');
    const formdata = ref<any>({
      name: null,
      description: null,
      planned_at: null,
      task_id: null

    })
    const closeModal = () => {
      isOpen.value = false;
      emit('update:modelValue', false);
      emit('closed');
    };

    const formatUTCToLocalInput = (utcString: any) => {
      if (!utcString) {
          return null; // Retorna nulo se não houver data
      }
      const date = new Date(utcString + 'Z');

      if (isNaN(date.getTime())) {
          console.error('Data inválida recebida:', utcString);
          return null; // Data inválida
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês é 0-11
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Acompanhar se o estado do modal for alterado fora
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
    });

    watch(() => props.task, (newVal) => {
      task.value = newVal;
    });

    const createActivity = async () => {
      formdata.value.task_id = task.value?.id;
      const payload = {
          name: formdata.value.name,
          description: formdata.value.description,
          planned_at: selectedDate.value ? selectedDate.value : null,
          task_id: formdata.value.task_id
      };
      
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      alert(data.message)

      formdata.value = {
        name: null, description: null, planned_at: null
      }
      selectedDate.value = ``;
      
      emit('created')
      emit('update:modelValue', false);
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
      selectedDate,
      createActivity
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
      class="w-[540px] bg-white rounded-lg shadow-lg p-[30px] relative max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Cabeçalho do modal -->
      <div class="text-xl font-semibold mb-2">Criar uma nova atividade</div>

      <!-- Conteúdo rolável do modal -->
      <div class="overflow-y-auto flex-1">
        <div class="grid grid-cols py-4">
          <div class="col-span-1">
            <div class="grid grid-cols-1">

              <div class="col-span-1">
                <form action="" class="grid grid-cols-1">
                  <div class="col-span-1">
                    <div class="flex flex-col relative mt-1">
                        <label v-if="formdata.name" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Título:</label>
                        <input v-model="formdata.name" type="text" name="" id="" placeholder="Título" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
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
                      <label v-if="selectedDate" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Data final:</label>
                      <input v-model="selectedDate" type="datetime-local" name="" id="" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                    </div>
                  </div>
                  <div class="col-span-1 mt-4">
                    <div class="flex items-center justify-end">
                      <Button @click.prevent="createActivity" label="Criar" color="bg-green-700" />
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