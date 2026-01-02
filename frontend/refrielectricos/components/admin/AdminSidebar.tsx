'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Productos', href: '/admin/products', icon: Package },
  { name: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Usuarios', href: '/admin/users', icon: Users },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 flex flex-col font-sans transition-all duration-300 ease-in-out shadow-2xl z-50">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
            <Zap className="text-white h-6 w-6 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-wide group-hover:text-blue-400 transition-colors">
              REFRI<span className="text-blue-400">ADMIN</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Control Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-2 text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent',
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-inner'
                  : 'hover:bg-slate-800/50 hover:text-white hover:border-slate-700/50'
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
              )}
              <item.icon 
                size={20} 
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                )} 
              />
              <span className="tracking-wide">{item.name}</span>
              
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30">
        <button
          onClick={logout}
          className="group flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-500/20"
        >
          <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-red-500/20 transition-colors">
            <LogOut size={18} />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-semibold">Cerrar Sesión</span>
            <span className="text-[10px] text-slate-500 group-hover:text-red-400/70">End session</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
