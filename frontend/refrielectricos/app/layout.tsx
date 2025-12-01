import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { ThemeProvider } from "@/components/theme-provider";
import QueryProvider from "@/components/providers/QueryProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Refrielectricos',
    default: 'Refrielectricos | Repuestos de Refrigeración y Electricidad',
  },
  description: "Tienda especializada en repuestos de refrigeración, aire acondicionado y electricidad. Envíos a todo el país.",
  keywords: ['refrigeración', 'electricidad', 'repuestos', 'aire acondicionado', 'herramientas'],
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://refrielectricos.com',
    siteName: 'Refrielectricos',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ToastProvider>
              {children}
              <SpeedInsights />
              <Analytics />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
