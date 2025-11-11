<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { vMaska } from "maska/vue";
import CreateActivityModal from './CreateActivityModal.vue';

export default defineComponent({
  name: 'TaskModal',
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
  emits: ['update:modelValue', 'closed', 'task-updated'],
  setup(props, { emit }) {
    const isOpen = ref(props.modelValue);
    const task = ref(props.task);
    const activities = ref<any[]>([]);
    const loading = ref<boolean>(true);
    const router = useRouter();
    const isCreateActivityModal = ref<boolean>(false)
    const isEditTaskModal = ref<boolean>(false)
    const closeModal = () => {
      isOpen.value = false;
      emit('update:modelValue', false);
      emit('closed');
    };

    // Acompanhar se o estado do modal for alterado fora
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
      // Se o modal está ABRINDO
      if (newVal === true) {
        getActivities(); // CHAMA AQUI!
      }
    });

    watch(() => props.task, (newVal) => {
      task.value = newVal;
    });

    const getActivities = async () => {
        // --- 1. A SOLUÇÃO "CINTO DE SEGURANÇA" ---
        // Se não houver ID, nem tenta.
        if (!task.value || !task.value.id) {
            console.warn('getActivities pulado: task.id ainda não está disponível.');
            activities.value = []; // Limpa atividades antigas
            loading.value = false; // Para o loading
            return;
        }
        // --- FIM DA SOLUÇÃO ---

        try {
            loading.value = true; // Inicia o loading aqui
            const response = await fetch(`/api/activities?task_id=${task.value.id}`);
            const data = await response.json();
            
            if(!data.error) {
                activities.value = data;
            }
        } catch(error) {
            console.log(error)
        } finally {
            loading.value = false; // Para o loading no fim
        }
    }

    const finishTask = async () => {
      try {
          const response = await fetch(`/api/tasks/finished/${task.value.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' }
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Erro ao concluir a tarefa');
          }

          const data = await response.json();
          alert(data.message);
          
          emit('task-updated');
          emit('update:modelValue', false);

      } catch (error) {
          console.error('Erro em updateTask:', error);
      }
    }

    // Fechar se o usuário clicar fora do modal (em um fundo opaco)
    const handleBackdropClick = (e: MouseEvent) => {
      if (props.closeOnBackdrop && e.target === e.currentTarget) {
        closeModal();
      }
    };

    const updatedTask = () => {
      closeModal()
      emit(`task-updated`);
    }

    return {
      isOpen,
      closeModal,
      handleBackdropClick,
      isCreateActivityModal,
      isEditTaskModal,
      activities,
      loading,
      updatedTask,
      getActivities,
      finishTask
    };
  },
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed px-2 inset-0 bg-black/50 bg-opacity-50 z-50 flex justify-center items-center"
    @click="handleBackdropClick"
  >
    <div
      class="w-[800px] bg-white rounded-lg shadow-lg p-[30px] relative max-h-[90vh] overflow-hidden flex flex-col"
    >
      <!-- Cabeçalho do modal -->
      <div class="flex flex-col mb-2">
        <div class="text-xl font-semibold">{{ task.name }}</div>
        <span class="text-sm font-[500]">ID: {{ task.id }}</span>
      </div>

      <!-- Conteúdo rolável do modal -->
      <div class="overflow-y-auto flex-1">
        <div class="grid grid-cols py-4">
          <div class="col-span-1">
            <div class="grid grid-cols-1">
              <div class="col-span-1">
                <div class="flex flex-col">
                  <div class="flex items-center">
                    <span class="text-[0.9rem]">Data de criação:</span>
                    <span class="text-sm ml-2">{{ task.created_at_formatted }}</span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-[0.9rem]">Data de entrega:</span>
                    <span class="text-sm ml-2">{{ task.planned_at_formatted }}</span>
                  </div>
                  <div class="flex items-center mt-2">
                    <Button @click="isEditTaskModal = true" label="Editar" color="bg-blue-700 text-white" />
                    <Button @click="finishTask()" label="Concluir" color="bg-red-700 text-white" class="ml-3" />
                  </div>
                </div>
              </div>

              <div class="col-span-1 mt-4">
                <div class="flex flex-col">
                  <div class="flex flex-col">
                    <h2 class="font-[600]">Descrição</h2>
                    <p>{{ task.description }}</p>
                  </div>
                  <div class="flex flex-col mt-2">
                    <h2 class="font-[600]">Observações</h2>
                    <p>{{ task.observation }}</p>
                  </div>
                </div>
              </div>

              <div v-if="!loading" class="col-span-1 mt-4">
                <div class="grid grid-cols-1 max-w-[97%] mx-auto">
                  <div class="col-span-1 bg-gray-100 p-3">
                    <div class="flex flex-col">
                      <h2 class="mb-2 font-[600]">Atividades</h2>
                      <div class="flex">
                        <Button @click="isCreateActivityModal = true" label="Criar atividade" color="bg-green-700 text-white" />
                      </div>
                      <div class="grid grid-cols-1 mt-2">
                        <div v-if="activities.length > 0" class="col-span-1">
                          <div class="grid grid-cols-1 gap-2">
                            <template v-for="activity in activities" :key="activity.id">
                              <div class="col-span-1 p-2 shadow text-sm bg-white">
                                <div class="flex flex-col">
                                  <span class="text-[0.75rem]">{{ activity.created_at_formatted }}</span>
                                  <p class="mt-1 font-[600]">
                                    {{ activity.name }}
                                  </p>
                                  <p class="mt-0">
                                    {{ activity.description }}
                                  </p>
                                </div>
                              </div>
                            </template>
                          </div>
                        </div>
                        <div v-else class="col-span-1 mt-2">
                          <span class="text-sm font-[500]">Não tem nenhuma atividade</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!---->
              <div v-else class="col-span-1 mt-4 flex justify-center items-center">
                    <div class="meu-spinner"></div>
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
  <CreateNewTask v-model="isEditTaskModal" :task="task" @task-updated="updatedTask()" />
  <CreateActivityModal v-model="isCreateActivityModal" :task="task" @created="getActivities()" />
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

  .meu-spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid #4F516C;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>