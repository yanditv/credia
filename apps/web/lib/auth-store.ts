// Zustand store para autenticación. Persiste tokens en localStorage y replica
// el access token en una cookie no-httpOnly para que el middleware de Next.js
// pueda hacer redirects en /admin/* sin esperar al cliente.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Role = 'USER' | 'ADMIN' | 'RISK_ANALYST';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: Role;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

const COOKIE_NAME = 'credia_auth_token';

function setCookie(token: string) {
  if (typeof document === 'undefined') return;
  // 1 hora — alineado con expiresIn del access token. SameSite=Lax para que
  // navegación normal envíe la cookie pero requests cross-site no.
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=3600; SameSite=Lax`;
}

function clearCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) => {
        setCookie(accessToken);
        set({ user, accessToken, refreshToken });
      },
      logout: () => {
        clearCookie();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'credia-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
