'use client';

import { useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { Trash2, Plus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Navbar from '@/components/layout/Navbar';
import { useCart } from '@/context/CartContext';

export default function WishlistsPage() {
    const { wishlists, createWishlist, deleteWishlist, removeFromWishlist } = useWishlist();
    const { addItem } = useCart();
    const [newListName, setNewListName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        await createWishlist(newListName);
        setNewListName('');
        setIsCreating(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddToCart = (product: any) => {
        addItem({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
        });
        alert('Agregado al carrito');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mis Listas de Favoritos</h1>
                    <Button onClick={() => setIsCreating(!isCreating)} size="sm">
                        <Plus size={16} className="mr-2" />
                        Nueva Lista
                    </Button>
                </div>

                {isCreating && (
                    <form onSubmit={handleCreateList} className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex gap-4 items-end">
                        <div className="grow">
                            <Input
                                label="Nombre de la lista"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="Ej: Para la cocina"
                            />
                        </div>
                        <Button type="submit">Crear</Button>
                    </form>
                )}

                <div className="space-y-8">
                    {wishlists.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">No tienes listas de favoritos aún.</p>
                        </div>
                    ) : (
                        wishlists.map((list) => (
                            <div key={list.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {list.name} <span className="text-sm font-normal text-gray-500">({list.items.length} productos)</span>
                                    </h2>
                                    <button
                                        onClick={() => {
                                            if (confirm('¿Eliminar esta lista?')) deleteWishlist(list.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Eliminar lista"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                    <div className="p-4">
                                    {list.items.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                                            <ShoppingCart size={48} className="mb-2 opacity-20" />
                                            <p className="text-sm italic">Tu lista está vacía</p>
                                            <Link href="/products" className="mt-2 text-xs text-blue-600 hover:underline">
                                                Explorar productos
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {list.items.map((item) => (
                                                <div key={item.id} className="group relative flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/30 transition-all duration-300">
                                                    <div className="w-24 h-24 relative shrink-0 bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
                                                        {item.product.image_url ? (
                                                            <Image 
                                                                src={item.product.image_url} 
                                                                alt={item.product.name} 
                                                                fill 
                                                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-110" 
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sin img</div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col justify-between grow min-w-0 py-1">
                                                        <div>
                                                            <Link href={`/products/${item.product.id}`} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 leading-tight mb-1">
                                                                {item.product.name}
                                                            </Link>
                                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                ${item.product.price.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <button
                                                                onClick={() => handleAddToCart(item.product)}
                                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 rounded-full transition-colors shadow-sm"
                                                                title="Agregar al carrito"
                                                            >
                                                                <ShoppingCart size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => removeFromWishlist(item.product.id, list.id)}
                                                                className="p-2 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-full transition-colors shadow-sm"
                                                                title="Quitar de la lista"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
