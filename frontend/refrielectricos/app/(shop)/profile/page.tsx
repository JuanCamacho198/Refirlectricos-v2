'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/hooks/useOrders';
import { Loader2, MapPin, CreditCard, LogOut, Edit2, CheckCircle, Clock, RefreshCw, Plus, Lock } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import AddressesList from '@/components/features/profile/addresses/AddressesList';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, logout, updateUser, isAuthenticated, isLoading } = useAuth();
  const { data: orders, isLoading: loadingOrders } = useOrders({ enabled: isAuthenticated });
  const router = useRouter();
  const { addToast } = useToast();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState(false);
  
  // Edit Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Solo redirigir cuando ya terminó de cargar y no está autenticado
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: '', 
      });
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.patch(`/users/${user.id}`, {
        name: profile.name,
      });
      
      updateUser({
        ...user,
        name: profile.name,
      });
      
      setIsEditProfileOpen(false);
      addToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error(error);
      addToast('Error al actualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loading mientras se hidrata el estado
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center mb-10">
          <div className="shrink-0 mb-4 md:mb-0 md:mr-6 relative w-24 h-24">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
              alt="Foto de perfil"
              fill
              className="rounded-full object-cover border-4 border-blue-900 dark:border-blue-700"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-500">{user.name || 'Usuario'}</h1>
            <p className="text-gray-500 dark:text-gray-400">¡Bienvenido de nuevo!</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mi Información */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Mi Información</h2>
                <button 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="bg-[#0f458b] text-white hover:bg-blue-800 font-bold py-2 px-4 rounded-lg flex items-center transition-colors text-sm"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar Perfil
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</label>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{user.name || 'No registrado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">No registrado</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Direcciones</label>
                  <button 
                    onClick={() => setIsAddressesOpen(true)}
                    className="mt-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <MapPin size={16} />
                    Gestionar Direcciones
                  </button>
                </div>
              </div>
            </div>

            {/* Mis Pedidos */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-6">Mis Pedidos</h2>
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Pedido #{order.id.slice(-8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="mt-2 sm:mt-0">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                          order.status === 'PAID' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {order.status === 'DELIVERED' && <CheckCircle className="mr-1 h-4 w-4" />}
                          {order.status === 'SHIPPED' && <Clock className="mr-1 h-4 w-4" />}
                          {order.status === 'PENDING' && <RefreshCw className="mr-1 h-4 w-4" />}
                          {order.status === 'PENDING' ? 'Procesando' : 
                           order.status === 'PAID' ? 'Pagado' :
                           order.status === 'SHIPPED' ? 'Enviado' :
                           order.status === 'DELIVERED' ? 'Entregado' :
                           order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tienes pedidos recientes.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Métodos de Pago */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-6">Métodos de Pago</h2>
              <div className="flex items-center border border-gray-200 dark:border-gray-700 p-3 rounded-lg">
                <div className="h-8 w-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center mr-4">
                   <CreditCard className="text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Visa **** 1234</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Expira 12/2026</p>
                </div>
              </div>
              <button className="mt-4 w-full bg-[#f5de0e] text-blue-900 hover:bg-yellow-500 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                <Plus className="mr-2 h-5 w-5" />
                Añadir método
              </button>
            </div>

            {/* Seguridad */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 mb-4">Seguridad</h2>
              <button className="flex items-center text-blue-900 dark:text-blue-400 hover:underline font-medium w-full text-left">
                <Lock className="mr-2 h-5 w-5" />
                Cambiar Contraseña
              </button>
              
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={logout}
                  className="flex items-center text-red-600 hover:text-red-700 font-medium w-full text-left"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Editar Perfil"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <p className="p-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg border border-transparent">
              {user.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ingresa tu teléfono"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={() => setIsEditProfileOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg"
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveProfile}
              className="bg-blue-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 flex items-center gap-2"
              disabled={saving}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddressesOpen}
        onClose={() => setIsAddressesOpen(false)}
        title="Mis Direcciones"
        className="max-w-4xl"
      >
        <AddressesList enabled={isAddressesOpen} />
      </Modal>

    </div>
  );
}
