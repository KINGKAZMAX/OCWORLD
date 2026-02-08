import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isChecking: boolean;
  setUser: (user: User | null) => void;
  setChecking: (value: boolean) => void;
  reset: () => void;
}

// Demo mode: auto-login with mock user
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@example.com',
  name: 'Demo User',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEMO_USER, // Auto-login for demo
      isChecking: false,
      setUser: (user) => set({ user }),
      setChecking: (value) => set({ isChecking: value }),
      reset: () => set({ user: null, isChecking: false }),
    }),
    {
      name: 'oc-world-auth',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);
