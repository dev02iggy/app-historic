<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { vMaska } from "maska/vue";

export default defineComponent({
  name: 'CreateNewTask',
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
      required: false
    }
  },
  directives: {
		maska: vMaska, // 👈 registra a diretiva
	},
  emits: ['update:modelValue', 'closed', 'created', 'task-updated'],
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue);
    const task = ref(props.task);
    const router = useRouter();
    const formdata = ref<any>({
      name: null,
      description: null,
      observation: null,
      planned_at: null,
      type: null,
      type_formatted: null,
      note: null
    });
    const selectedType = ref<any>(null)
    const selectedDate = ref<any>('')
    const types = ref<any[]>([
      { id: 1, label: 'Muito urgente' },
      { id: 2, label: 'Urgente' },
      { id: 3, label: 'Pouco urgente' },
      { id: 4, label: 'Nada urgente' }
    ])

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

    const closeModal = () => {
      isOpen.value = false;
      emit('update:modelValue', false);
      emit('closed');
    };

    const initializeForm = (taskToLoad: any) => {
      if (taskToLoad && taskToLoad.id) {
        formdata.value = {
          name: taskToLoad.name,
          description: taskToLoad.description,
          observation: taskToLoad.observation,
          planned_at: taskToLoad.planned_at,
          type: taskToLoad.type,
          type_formatted: taskToLoad.type_formatted,
          note: taskToLoad.note
        };

        if (taskToLoad.type) {
          selectedType.value = {
            id: taskToLoad.type,
            label: taskToLoad.type_formatted
          };
        } else {
          selectedType.value = null;
        }

        if (taskToLoad.planned_at) {
          // Aqui usamos a sua função de formatação!
          selectedDate.value = formatUTCToLocalInput(taskToLoad.planned_at);
        } else {
          selectedDate.value = '';
        }
      } else {
        // --- MODO CRIAÇÃO ---
        formdata.value = {
          name: null,
          description: null,
          observation: null,
          planned_at: null,
          type: null,
          type_formatted: null,
          note: null
        };
        selectedType.value = null;
        selectedDate.value = '';
      }
    };

    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
    });

    watch(() => props.task, (newTask) => {
      task.value = newTask;
      initializeForm(newTask);
    }, {
      immediate: true
    });

    const goRouter = () => {
      router.push(`/tarefas`)
    }

    const createTask = async () => {
      const payload = {
          name: formdata.value.name,
          description: formdata.value.description,
          observation: formdata.value.observation,
          type: selectedType.value?.id,
          type_formatted: selectedType.value?.label,
          planned_at: selectedDate.value ? selectedDate.value : null,
          note: formdata.value.note
      };
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      alert(data.message)

      formdata.value = {
        name: null, description: null, observation: null,
        planned_at: null, type: null, type_formatted: null, note: null
      }
      selectedDate.value = ``;
      selectedType.value = null;
      
      emit('created')
      emit('update:modelValue', false);
    }

    const updateTask = async () => {
      if (!task.value || !task.value.id) {
          console.error('Nenhuma tarefa para atualizar.');
          return;
      }
      
      const payload = {
        name: formdata.value.name,
        description: formdata.value.description,
        observation: formdata.value.observation,
        type: selectedType.value?.id,
        type_formatted: selectedType.value?.label,
        planned_at: selectedDate.value ? selectedDate.value : null,
        note: formdata.value.note
      };

      try {
          const response = await fetch(`/api/tasks/${task.value.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload) // Envia o payload corrigido
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Erro ao atualizar a tarefa');
          }

          const data = await response.json();
          alert(data.message);
          
          emit('task-updated');
          emit('update:modelValue', false);

      } catch (error) {
          console.error('Erro em updateTask:', error);
      }
    }

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
      task,
      createTask,
      types,
      selectedDate,
      selectedType,
      updateTask
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
      <div class="text-xl font-semibold mb-2">{{ task?.id ? 'Editar' : 'Criar' }} tarefa</div>
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
                        <label v-if="formdata.observation" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Observação:</label>
                        <textarea v-model="formdata.observation" rows="3" name="" id="" placeholder="Observação" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1" />
                    </div>
                  </div>
                  <!--<div class="col-span-1 mt-1">
                    <div class="flex flex-col relative mt-1">
                      <label v-if="formdata.date_end_at" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Data final:</label>
                      <input v-model="formdata.date_end_at" type="text" name="" id="" placeholder="Data final" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                    </div>
                  </div>-->
                  <div class="col-span-1 mt-1">
                    <div class="flex flex-col relative mt-1">
                      <label class="text-gray-500" for="" style="z-index: 100;">Data final:</label>
                      <input v-model="selectedDate" type="datetime-local" name="" id="" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                    </div>
                  </div>
                  <div class="col-span-1">
                    <div class="flex flex-col relative mt-1">
                        <label v-if="formdata.note" class="absolute top-[-11px] left-[5px] text-gray-500" for="" style="z-index: 100;">Nota:</label>
                        <input v-model="formdata.note" type="text" name="" id="" placeholder="Nota" class="mt-1 border-2 border-gray-200 rounded bg-gray-200 py-1 pl-2 pr-1">
                    </div>
                  </div>
                  <div class="col-span-1 mt-3">
                    <div class="flex flex-col">
                      <select
                        v-model="selectedType"
                        class="w-full border-1 border-neutral-400 rounded py-2 px-4 text-sm text-neutral-600"
                      >
                        <option :value="null" disabled selected>Escolha o tipo</option>
                        <template v-for="type, in types" :key="type.id">
                          <option :value="type">{{ type.label }}</option>
                        </template>
                      </select>
                    </div>
                  </div>
                  <div class="col-span-1 mt-4">
                    <div class="flex items-center justify-end">
                      <Button v-if="!task?.id" @click.prevent="createTask" label="Criar" color="bg-green-700" />
                      <Button v-else @click.prevent="updateTask" label="Salvar" color="bg-green-700" />
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