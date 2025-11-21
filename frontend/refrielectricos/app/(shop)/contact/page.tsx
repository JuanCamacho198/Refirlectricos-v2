'use client';

import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del formulario
    alert('Mensaje enviado (simulado)');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contáctanos</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Estamos aquí para ayudarte. Visítanos en nuestra tienda, llámanos o envíanos un mensaje.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Información de Contacto */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Dirección</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Calle 123 # 45-67<br />
                    Barrio El Centro<br />
                    Bogotá, Colombia
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Teléfono</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    +57 (601) 123-4567<br />
                    +57 300 123-4567
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    info@refrielectricos.com<br />
                    soporte@refrielectricos.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Horario de Atención</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                    Sábados: 9:00 AM - 2:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mapa */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden h-80 shadow-sm border border-gray-100 dark:border-gray-700 relative">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.854876862664!2d-74.0736786241466!3d4.619635342353617!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a2f99b4353%3A0x6f932f4370c6c53!2sBogot%C3%A1!5e0!3m2!1ses!2sco!4v1716300000000!5m2!1ses!2sco" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Nombre" placeholder="Tu nombre" required />
              <Input label="Apellido" placeholder="Tu apellido" required />
            </div>
            <Input label="Email" type="email" placeholder="tu@email.com" required />
            <Input label="Teléfono" type="tel" placeholder="+57 300..." />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensaje</label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="¿En qué podemos ayudarte?"
                required
              ></textarea>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg">
              <Send size={18} />
              Enviar Mensaje
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
