import { Metadata, ResolvingMetadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function getProduct(term: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/products/${term}`, {
      next: { revalidate: 60 } 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Refrielectricos',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${product.name} | Refrielectricos`,
    description: product.description || `Compra ${product.name} al mejor precio en Refrielectricos.`,
    openGraph: {
      title: product.name,
      description: product.description || `Compra ${product.name} al mejor precio en Refrielectricos.`,
      images: product.image_url ? [product.image_url, ...previousImages] : previousImages,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const id = (await params).id;
  const product = await getProduct(id);

  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Refrielectricos',
    },
    offers: {
      '@type': 'Offer',
      url: `https://refrielectricos.com/products/${product.slug || product.id}`,
      priceCurrency: 'COP',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient />
    </>
  );
}
