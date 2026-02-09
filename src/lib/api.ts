// Local API client - replaces @edgespark/client with standard fetch
import { useAuthStore } from '@/store/authStore';

function getAuthHeaders(): HeadersInit {
  const user = useAuthStore.getState().user;
  if (user) {
    return { Authorization: `Bearer ${user.id}` };
  }
  return {};
}

export const client = {
  api: {
    fetch: (url: string, options?: RequestInit) =>
      fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options?.headers,
        },
        credentials: "include" as RequestCredentials,
      }),
  },
  auth: {
    getSession: async () => {
      try {
        const res = await fetch("/api/auth/session", {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        return await res.json();
      } catch {
        return { data: null };
      }
    },
    signOut: async () => {
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: "include",
        });
      } catch {
        // ignore
      }
    },
    renderAuthUI: () => {
      // no-op: handled by Login.tsx Google login
    },
  },
};
