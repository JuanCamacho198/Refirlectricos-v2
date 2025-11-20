'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';
import { Wishlist } from '@/types/wishlist';

interface WishlistContextType {
  wishlists: Wishlist[];
  loading: boolean;
  refreshWishlists: () => Promise<void>;
  createWishlist: (name: string) => Promise<void>;
  deleteWishlist: (id: string) => Promise<void>;
  addToWishlist: (productId: string, wishlistId?: string) => Promise<void>;
  removeFromWishlist: (productId: string, wishlistId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlists = async () => {
    if (!user) {
      setWishlists([]);
      return;
    }
    try {
      const res = await api.get('/wishlists');
      setWishlists(res.data);
    } catch (error) {
      console.error('Error fetching wishlists:', error);
    }
  };

  useEffect(() => {
    refreshWishlists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const createWishlist = async (name: string) => {
    try {
      setLoading(true);
      await api.post('/wishlists', { name });
      await refreshWishlists();
    } finally {
      setLoading(false);
    }
  };

  const deleteWishlist = async (id: string) => {
    try {
      setLoading(true);
      await api.delete(`/wishlists/${id}`);
      await refreshWishlists();
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string, wishlistId?: string) => {
    if (!user) return; // TODO: Redirigir a login o mostrar toast
    
    let targetListId = wishlistId;

    // Si no se especifica lista, usar la primera o crear una "Favoritos"
    if (!targetListId) {
      if (wishlists.length === 0) {
        const res = await api.post('/wishlists', { name: 'Favoritos' });
        targetListId = res.data.id;
        // Actualizamos estado local optimista o esperamos refresh
        setWishlists([res.data]); 
      } else {
        targetListId = wishlists[0].id;
      }
    }

    try {
      await api.post(`/wishlists/${targetListId}/items`, { productId });
      await refreshWishlists();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).response?.status === 409) {
        // Ya existe, no hacemos nada o mostramos toast
        console.log('El producto ya está en la lista');
        return;
      }
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: string, wishlistId: string) => {
    try {
      await api.delete(`/wishlists/${wishlistId}/items/${productId}`);
      await refreshWishlists();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlists.some(list => list.items.some(item => item.productId === productId));
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
        alert('Debes iniciar sesión para guardar favoritos');
        return;
    }

    const listWithProduct = wishlists.find(list => list.items.some(item => item.productId === productId));

    if (listWithProduct) {
      // Si ya está, lo quitamos de esa lista
      await removeFromWishlist(productId, listWithProduct.id);
    } else {
      // Si no está, lo agregamos a la default
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlists,
      loading,
      refreshWishlists,
      createWishlist,
      deleteWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      toggleWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
