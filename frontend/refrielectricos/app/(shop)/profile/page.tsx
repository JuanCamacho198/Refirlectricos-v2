'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Loader2, MapPin, CreditCard, Shield, LogOut, Edit2, Save } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  const { data: orders, isLoading: loadingOrders } = useOrders();
  const router = useRouter();
  const { addToast } = useToast();

  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '', // Note: Phone is not yet supported by backend User model
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: '', // Placeholder
      });
    }
  }, [isAuthenticated, user, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update user in backend
      await api.patch(`/users/${user.id}`, {
        name: profile.name,
        // phone: profile.phone // Backend doesn't support phone yet
      });
      
      // Update local user state
      updateUser({
        ...user,
        name: profile.name,
      });
      
      setEditMode(false);
      addToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error(error);
      addToast('Error al actualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-24 h-24 shrink-0">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
              alt="Foto de perfil"
              fill
              className="rounded-full border-4 border-blue-900 dark:border-blue-700 object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-500">Mi Perfil</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Bienvenido de nuevo, <strong className="text-gray-900 dark:text-white">{user.email}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left Column) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mi Información */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Mi Información</h2>
                {!editMode ? (
                  <button 
                    onClick={() => setEditMode(true)} 
                    className="flex items-center gap-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                    Editar Información
                  </button>
                ) : (
                  <button 
                    onClick={handleSaveProfile} 
                    className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50"
                    disabled={saving}
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Guardar
                  </button>
                )}
              </div>

              {!editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile.name || 'Sin nombre'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                    <p className="font-semibold text-gray-900 dark:text-white">{profile.phone || 'No registrado'}</p>
                  </div>
                  <div className="flex items-end">
                    <Link href="/profile/addresses" className="w-full">
                      <button className="w-full bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2">
                        <MapPin size={18} />
                        Direcciones
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Nombre</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ingresa tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <p className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-transparent">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Ingresa tu teléfono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mis Pedidos */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Mis Pedidos</h2>
                <Link href="/profile/orders" className="text-sm text-blue-600 hover:underline">
                  Ver todos
                </Link>
              </div>
              
              {loadingOrders ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-blue-600" />
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-bold text-gray-900 dark:text-white">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        order.status === 'PAID' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {order.status === 'PENDING' ? 'Procesando' : 
                         order.status === 'PAID' ? 'Pagado' :
                         order.status === 'SHIPPED' ? 'Enviado' :
                         order.status === 'DELIVERED' ? 'Entregado' :
                         order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tienes pedidos recientes.</p>
              )}
            </div>
          </div>

          {/* Sidebar (Right Column) */}
          <div className="space-y-6">
            
            {/* Métodos de Pago */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4">Métodos de Pago</h2>
              <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-700 rounded-lg mb-4">
                <div className="w-12 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                  <CreditCard className="text-gray-500" size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">**** **** **** 1234</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Expira 12/25</p>
                </div>
              </div>
              <button className="w-full bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors text-sm">
                Añadir método
              </button>
            </div>

            {/* Seguridad */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400 mb-4">Seguridad</h2>
              <button className="w-full bg-blue-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                <Shield size={18} />
                Cambiar Contraseña
              </button>
            </div>

            {/* Logout */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <button 
                onClick={logout} 
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Cerrar Sesión
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
