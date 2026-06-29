import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)

  return {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loading,
    error,
  }
}

export default useAuth
