'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user } = useAuth();

  const navItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: Home,
      active: pathname === '/'
    },
    {
      label: 'Catálogo',
      href: '/products',
      icon: Grid,
      active: pathname.startsWith('/products')
    },
    {
      label: 'Carrito',
      href: '/cart',
      icon: ShoppingCart,
      active: pathname === '/cart',
      badge: totalItems
    },
    {
      label: user ? 'Perfil' : 'Ingresar',
      href: user ? '/profile' : '/login',
      icon: User,
      active: pathname.startsWith('/profile') || pathname === '/login'
    }
  ];

  // Hide on admin routes or specific pages if needed
  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1",
              item.active 
                ? "text-blue-600 dark:text-blue-400" 
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            <div className="relative">
              <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
              {item.badge ? (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-900">
                  {item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
