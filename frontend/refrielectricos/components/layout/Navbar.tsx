'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, LogOut, Settings, MapPin, Package, LayoutDashboard, Heart, Menu, X, ChevronDown, ChevronRight, Clock, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAddresses } from '@/hooks/useAddresses';
import api from '@/lib/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import NotificationsDropdown from '@/components/layout/NotificationsDropdown';
import SearchBox from '@/components/features/search/SearchBox';

interface CategoryStructure {
  name: string;
  subcategories: string[];
}

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { addresses } = useAddresses({ enabled: !!user });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const defaultAddress = user ? (addresses.find(a => a.isDefault) || addresses[0]) : null;

  const { data: metadata } = useQuery({
    queryKey: ['categories-menu'],
    queryFn: async () => {
      const { data } = await api.get('/products/metadata');
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const categories: CategoryStructure[] = metadata?.structure || [];

  // Fetch store settings for free shipping banner
  const { data: storeSettings } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/settings');
        return data;
      } catch {
        return { 
          freeShippingEnabled: true, 
          freeShippingBannerText: 'Envío gratis en Curumaní desde $100,000',
          freeShippingEmoji: '🚚'
        };
      }
    },
    staleTime: 1000 * 60 * 60,
  });

  // Stable scroll logic with hysteresis to prevent flickering
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    // Use hysteresis: scroll down past 80px to compress, scroll up past 40px to expand
    setIsScrolled(prev => {
      if (!prev && scrollY > 80) return true;
      if (prev && scrollY < 40) return false;
      return prev;
    });
  }, []);

  useEffect(() => {
    // Use passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/30 transition-all duration-300 shadow-sm ${
        isScrolled ? 'py-2' : 'py-3'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Row: Logo & Search */}
          <div className={`flex items-center gap-4 md:gap-8 transition-all duration-300 ${isScrolled ? 'mb-0' : 'mb-2 md:mb-3'}`}>
            {/* Mobile Menu Button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <Link 
              href="/" 
              className="shrink-0 flex items-center gap-2 hover:scale-105 transition-transform duration-200"
            >
              <Image 
                src="/images/RefriLogo.png" 
                alt="Refrielectricos Logo" 
                width={32} 
                height={32} 
                className={`transition-all duration-300 ${isScrolled ? 'w-6 h-6 md:w-8 md:h-8' : 'w-8 h-8 md:w-10 md:h-10'}`}
              />
              <span className={`font-extrabold tracking-tight leading-none whitespace-nowrap bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent block transition-all duration-300 ${
                isScrolled ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
              }`}>
                Refrielectricos
              </span>
            </Link>

            {/* Search Bar (Expanded) */}
            <div className="flex-1 max-w-md mx-auto hidden md:block">
              <SearchBox />
            </div>

            {/* Free Shipping Badge - Only show if enabled */}
            {storeSettings?.freeShippingEnabled !== false && (
              <div className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-300 ${isScrolled ? 'opacity-0 w-0 overflow-hidden px-0' : 'opacity-100'}`}>
                <span className="text-sm">{storeSettings?.freeShippingEmoji || '🚚'}</span>
                <span>{storeSettings?.freeShippingBannerText || 'Envío gratis en Curumaní desde $100,000'}</span>
              </div>
            )}

            {/* Theme Toggle (Moved to top right for balance) */}
            <div className={`hidden md:block transition-opacity duration-300 ${isScrolled ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
               <ThemeToggle />
            </div>

            {/* Right Actions (Visible on Scroll) */}
            {isScrolled && (
              <div className="hidden md:flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {user && <NotificationsDropdown />}
                {user ? (
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 focus:outline-none group"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800 group-hover:border-blue-300 transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    {/* Dropdown logic remains same, just hidden trigger text */}
                    {(isProfileOpen) && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                      
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 mb-1"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Panel Admin
                        </Link>
                      )}
                      <Link
                        href="/profile/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        Mis Compras
                      </Link>
                      <Link
                        href="/profile/wishlists"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        Favoritos
                      </Link>
                      <Link
                        href="/profile/history"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Clock className="h-4 w-4" />
                        Historial
                      </Link>
                      <Link
                        href="/profile/reviews"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Star className="h-4 w-4" />
                        Mis Reseñas
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Mi Perfil
                      </Link>
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium shadow-sm text-sm"
                  >
                    Ingresa
                  </Link>
                )}
                <Link 
                  href="/cart" 
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 group"
                >
                  <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-900">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Row: Address, Categories, Nav, User Actions */}
          <div className={`hidden md:flex items-center justify-between gap-4 transition-all duration-300 ${
            isScrolled ? 'h-0 opacity-0 pt-0 overflow-hidden' : 'h-auto opacity-100 pt-1 overflow-visible'
          }`}>
          
          {/* Left: Address & Categories */}
          <div className="flex items-center gap-6">
            {/* Address Widget */}
            <Link 
              href={user ? "/profile/addresses" : "/login"}
              className="flex items-center gap-2 min-w-[180px] max-w-[250px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 rounded-md transition-colors group"
            >
              <MapPin className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" size={20} />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] text-gray-500 dark:text-gray-400">
                  {user ? `Enviar a ${user.name.split(' ')[0]}` : 'Hola, identifícate'}
                </span>
                <span className="text-xs font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user 
                    ? (defaultAddress ? `${defaultAddress.addressLine1}` : 'Agregar dirección') 
                    : 'Ingresa tu ubicación'}
                </span>
              </div>
            </Link>

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Categorías
                <ChevronDown size={16} className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-100 z-50">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <div 
                        key={cat.name} 
                        className="group relative"
                      >
                        <Link
                          href={`/products?category=${encodeURIComponent(cat.name)}`}
                          className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          <span>{cat.name}</span>
                          {cat.subcategories.length > 0 && (
                            <ChevronRight size={14} className="text-gray-400" />
                          )}
                        </Link>
                        
                        {/* Subcategories Flyout */}
                        {cat.subcategories.length > 0 && (
                          <div className="hidden md:block absolute left-full top-0 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 -ml-1">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700 mb-1">
                              Subcategorías
                            </div>
                            {cat.subcategories.map((sub) => (
                              <Link
                                key={sub}
                                href={`/products?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                onClick={() => setIsCategoriesOpen(false)}
                              >
                                {sub}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Cargando categorías...
                    </div>
                  )}
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                    <Link
                      href="/products"
                      className="block px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      Ver todas
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-4">
              <Link href="/products" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Productos</Link>
          
            </div>
          </div>

          {/* Right: User & Cart */}
          <div className="flex items-center gap-6">
            {user && <NotificationsDropdown />}
            {/* User Menu */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none group"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800 group-hover:border-blue-300 transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
                </button>

                {(isProfileOpen) && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 mb-1"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Panel Admin
                      </Link>
                    )}
                    <Link
                      href="/profile/orders"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package className="h-4 w-4" />
                      Mis Compras
                    </Link>
                    <Link
                      href="/profile/wishlists"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
                      Favoritos
                    </Link>
                    <Link
                      href="/profile/history"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Clock className="h-4 w-4" />
                      Historial
                    </Link>
                    <Link
                      href="/profile/reviews"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Star className="h-4 w-4" />
                      Mis Reseñas
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Mi Perfil
                    </Link>
                    
                    <div className="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm">
                <Link 
                  href="/register" 
                  className="px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors font-medium"
                >
                  Crea tu cuenta
                </Link>
                <Link 
                  href="/login" 
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium shadow-sm"
                >
                  Ingresa
                </Link>
              </div>
            )}

            {user && (
              <>
                <Link 
                  href="/profile/orders" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Mis compras
                </Link>

                <Link 
                  href="/profile/wishlists" 
                  className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Favoritos
                </Link>
              </>
            )}

            <Link 
              href="/cart" 
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 group"
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-gray-900">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu (Simplified for now, keeping existing logic but updated styles) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-4 animate-in slide-in-from-top-5 mt-2">
            <div className="flex flex-col space-y-2 px-2">
              {user && (
                <Link 
                  href="/profile/addresses"
                  className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enviar a {user.name}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {defaultAddress ? defaultAddress.addressLine1 : 'Agregar dirección'}
                  </p>
                </Link>
              )}
              <Link 
                href="/contact" 
                className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>
              <Link 
                href="/faq" 
                className="px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Preguntas Frecuentes
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
