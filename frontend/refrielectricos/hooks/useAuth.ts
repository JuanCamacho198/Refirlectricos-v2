import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { User } from '@/types/user';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useCartStore } from '@/store/cartStore';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const { user, token, setAuth, logout: storeLogout, updateUser, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToast();
  const clearCart = useCartStore((state) => state.clearCart);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      const token = response.data.access_token;

      // Decode token manually to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);

      // Fetch full user profile
      const userResponse = await api.get(`/users/${payload.sub}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user: User = {
        id: userResponse.data.id,
        email: userResponse.data.email,
        name: userResponse.data.name || payload.email.split('@')[0],
        role: userResponse.data.role
      };

      return { user, token, rememberMe: credentials.rememberMe ?? false };
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.rememberMe);
      addToast('Bienvenido', 'success');
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const message = err.response?.data?.message || 'Credenciales inválidas';
      addToast(message, 'error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      await api.post('/auth/register', data);
    },
    onSuccess: () => {
      addToast('Cuenta creada exitosamente', 'success');
      router.push('/login?registered=true');
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const message = err.response?.data?.message || 'Error al registrarse';
      addToast(message, 'error');
    },
  });

  const logout = () => {
    storeLogout();
    clearCart();
    router.push('/');
    addToast('Sesión cerrada', 'info');
  };

  return {
    logout,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    updateUser,
    user,
    token,
    isAuthenticated: !!token,
    isLoading: !_hasHydrated,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
};
