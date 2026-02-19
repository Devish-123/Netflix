import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const AUTH_KEY = 'netflix_auth'

export const useAuthStore = create(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (phone, password) => {
        set({ isLoggedIn: true, user: { phone } })
      },
      logout: () => {
        set({ isLoggedIn: false, user: null })
      },
    }),
    { name: AUTH_KEY }
  )
)
