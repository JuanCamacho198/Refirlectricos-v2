import { Cookie, Info, Settings, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Política de Cookies | Refrielectricos',
  description: 'Información sobre el uso de cookies en Refrielectricos G&E S.A.S.',
};

export default function CookiesPage() {
  return (
    <div className="bg-white dark:bg-gray-900 transition-colors min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600 dark:text-orange-400 mb-4">
            <Cookie size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Cookies
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Entendiendo cómo y por qué usamos cookies.
          </p>
        </div>

        <div className="prose prose-blue dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Info size={24} className="text-orange-600" /> ¿Qué son las cookies?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Las cookies son pequeños archivos de texto que los sitios web que visita colocan en su ordenador o dispositivo móvil. Se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">¿Cómo usamos las cookies?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              En Refrielectricos utilizamos cookies para varios propósitos:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                <strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento del sitio web. Le permiten navegar y utilizar funciones como el carrito de compras y el acceso a áreas seguras.
              </li>
              <li>
                <strong>Cookies de Rendimiento:</strong> Recopilan información sobre cómo los visitantes usan nuestro sitio web, por ejemplo, qué páginas visitan con más frecuencia. Estos datos son anónimos y se usan para mejorar el funcionamiento del sitio.
              </li>
              <li>
                <strong>Cookies de Funcionalidad:</strong> Permiten que el sitio web recuerde las elecciones que hace (como su nombre de usuario, idioma o región) y proporcione características mejoradas y más personales.
              </li>
              <li>
                <strong>Cookies de Publicidad:</strong> Se utilizan para entregar anuncios más relevantes para usted y sus intereses. También se usan para limitar la cantidad de veces que ve un anuncio y para medir la efectividad de las campañas publicitarias.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings size={24} className="text-orange-600" /> Gestión de Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              La mayoría de los navegadores web le permiten controlar las cookies a través de sus configuraciones. Sin embargo, si limita la capacidad de los sitios web para establecer cookies, puede empeorar su experiencia general de usuario, ya que no será personalizada para usted. También puede impedirle guardar configuraciones personalizadas como la información de inicio de sesión.
            </p>
          </section>

          <div className="mt-12 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800 flex items-start gap-4">
            <ShieldCheck className="text-orange-600 dark:text-orange-400 shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Su Privacidad</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Para obtener más información sobre cómo utilizamos sus datos personales, consulte nuestra <a href="/privacy" className="text-blue-600 hover:underline">Política de Privacidad</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
