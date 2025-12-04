'use client';

import { useState } from 'react';
import { Save, Globe, Mail, Bell, Truck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useToast } from '@/context/ToastContext';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  
  // Mock initial data
  const [settings, setSettings] = useState({
    storeName: 'Refrielectricos G&E',
    supportEmail: 'contacto@refrielectricos.com',
    phoneNumber: '+57 300 123 4567',
    currency: 'COP',
    maintenanceMode: false,
    emailNotifications: true,
    freeShippingThreshold: 100000,
    freeShippingCity: 'Curumaní',
    freeShippingEnabled: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addToast('Configuración guardada correctamente', 'success');
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración de la Tienda</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Globe size={20} className="text-blue-600" />
            Información General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Tienda"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
            />
            <Input
              label="Moneda"
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              disabled // Hardcoded for now
            />
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Mail size={20} className="text-blue-600" />
            Contacto y Soporte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email de Soporte"
              name="supportEmail"
              type="email"
              value={settings.supportEmail}
              onChange={handleChange}
            />
            <Input
              label="Teléfono"
              name="phoneNumber"
              value={settings.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </Card>

        {/* Shipping Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Truck size={20} className="text-blue-600" />
            Configuración de Envíos
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Envío Gratis Habilitado</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mostrar banner de envío gratis en la tienda</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="freeShippingEnabled"
                  checked={settings.freeShippingEnabled}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ciudad con Envío Gratis"
                name="freeShippingCity"
                value={settings.freeShippingCity}
                onChange={handleChange}
                placeholder="Ej: Curumaní"
              />
              <Input
                label="Monto Mínimo para Envío Gratis"
                name="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold.toString()}
                onChange={handleChange}
                placeholder="100000"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              El mensaje que se mostrará será: &quot;Envío gratis en {settings.freeShippingCity} desde ${settings.freeShippingThreshold.toLocaleString()}&quot;
            </p>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Bell size={20} className="text-blue-600" />
            Sistema y Notificaciones
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Modo Mantenimiento</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Desactiva la tienda para los clientes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Notificaciones por Email</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recibir alertas de nuevos pedidos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
