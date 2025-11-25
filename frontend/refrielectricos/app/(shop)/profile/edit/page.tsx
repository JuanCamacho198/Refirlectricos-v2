'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la página principal de perfil
    router.replace('/profile');
  }, [router]);

  return null;
}
