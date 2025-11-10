import { defineStore } from 'pinia'

// Definimos os tipos para o user e profile (opcional, mas bom)
interface AuthUser {
  id: string;
  email?: string;
  // Adicione mais campos do 'user' se precisar
}

interface UserProfile {
  id: string;
  name?: string;
  // Adicione mais campos do seu 'profile'
}

export const useAuthentication = defineStore('authentication', {
  state: () => ({
    user: null as AuthUser | null,
    profile: null as UserProfile | null,
  }),

  getters: {
    /**
     * Getter simples para saber se o usuário está logado.
     */
    isLoggedIn: (state) => !!state.user,
    
    /**
     * Getter para o ID do usuário (seus setters pediam isso)
     */
    getUserId: (state) => state.user?.id || null,
    
    /**
     * Getter para o ID do perfil
     */
    getProfileId: (state) => state.profile?.id || null,
  },

  actions: {
    /**
     * Define o usuário do Auth.
     */
    setUser(newUser: AuthUser | null) {
      this.user = newUser;
    },

    /**
     * Define o perfil do usuário (da tabela 'profiles').
     */
    setProfile(newProfile: UserProfile | null) {
      this.profile = newProfile;
    },

    /**
     * Ação principal: Pega o usuário do Supabase Auth
     * e usa o ID dele para buscar o perfil na tabela 'profiles'.
     */
    async fetchAndSetUser(user: AuthUser) {
      // 1. Pega o $supabase do plugin do Nuxt
      // (Não podemos usar 'this' aqui, então pegamos do NuxtApp)
      const { $supabase } = useNuxtApp();

      // 2. Define o usuário do Auth
      this.setUser(user);

      // 3. Busca o 'profile' correspondente no banco
      try {
        const { data: profileData, error } = await $supabase
          .from('profiles') // Assumindo que sua tabela é 'profiles'
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error.message);
          this.setProfile(null); // Limpa o perfil se der erro
        } else {
          this.setProfile(profileData);
        }
      } catch (err) {
        console.error('Exceção ao buscar perfil:', err);
        this.setProfile(null);
      }
    },

    /**
     * Limpa todo o estado de autenticação (logout).
     */
    clearAuth() {
      this.user = null;
      this.profile = null;
    }
  }
})