// Local API client - replaces @edgespark/client with standard fetch

export const client = {
  api: {
    fetch: (url: string, options?: RequestInit) =>
      fetch(url, { ...options, credentials: "include" as RequestCredentials }),
  },
  auth: {
    getSession: async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "include" });
        return await res.json();
      } catch {
        return { data: null };
      }
    },
    signOut: async () => {
      try {
        await fetch("/api/auth/signout", { method: "POST", credentials: "include" });
      } catch {
        // ignore
      }
    },
    renderAuthUI: () => {
      // no-op: replaced by Login.tsx demo button
    },
  },
};
