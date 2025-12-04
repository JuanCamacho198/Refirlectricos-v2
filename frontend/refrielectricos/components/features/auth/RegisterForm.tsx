'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useCartStore } from '@/store/cartStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const { register, login, isRegistering } = useAuth();
  const { mergeCart } = useCart();
  const localItems = useCartStore(state => state.items);
  const clearLocalCart = useCartStore(state => state.clearCart);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Register the user
      await register(formData);
      
      // 2. Auto-login after registration
      setIsLoggingIn(true);
      await login({ email: formData.email, password: formData.password, rememberMe: true });
      
      // 3. Merge local cart to user's account (only on registration)
      if (localItems.length > 0) {
        const itemsToMerge = localItems.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }));
        await mergeCart(itemsToMerge);
        clearLocalCart();
      }

      router.push('/');
    } catch {
      // Error handled in hook
      setIsLoggingIn(false);
    }
  };

  const isProcessing = isRegistering || isLoggingIn;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Nombre completo"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Juan Pérez"
          autoComplete="name"
        />
      </div>

      <div>
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="juan@ejemplo.com"
          autoComplete="email"
        />
      </div>

      <div>
        <Input
          label="Contraseña"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing}
      >
        {isRegistering ? 'Creando cuenta...' : isLoggingIn ? 'Iniciando sesión...' : 'Crear cuenta'}
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          Inicia sesión
        </Link>
      </div>
    </form>
  );
}
