import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Refrielectricos",
  description: "Tienda de repuestos de refrigeración y electricidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gray-50">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
