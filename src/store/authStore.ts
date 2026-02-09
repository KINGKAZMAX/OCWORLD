import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isChecking: boolean;
  setUser: (user: User | null) => void;
  setChecking: (value: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isChecking: false,
      setUser: (user) => set({ user }),
      setChecking: (value) => set({ isChecking: value }),
      reset: () => set({ user: null, isChecking: false }),
    }),
    {
      name: 'oc-world-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
