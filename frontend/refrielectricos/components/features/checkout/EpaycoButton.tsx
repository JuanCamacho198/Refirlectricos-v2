'use client';

import { useState, useCallback, FormEvent } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

interface CartItem {
  id: string;
  quantity: number;
}

interface EpaycoButtonProps {
  userId: string;
  addressId: string;
  items: CartItem[];
  notes?: string;
  totalPrice: number;
  disabled?: boolean;
  onError?: (error: string) => void;
  onOrderCreated?: (orderId: string) => void;
}

// ePayco checkout URL
const EPAYCO_CHECKOUT_URL = 'https://secure.epayco.co/checkout.php';

/**
 * EpaycoButton Component
 * 
 * Handles the ePayco payment flow:
 * 1. Calls backend to create payment session
 * 2. Receives ePayco form data
 * 3. Creates and submits hidden form to ePayco
 * 4. User is redirected to ePayco checkout
 */
export default function EpaycoButton({
  userId,
  addressId,
  items,
  notes,
  totalPrice,
  disabled = false,
  onError,
  onOrderCreated,
}: EpaycoButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayWithEpayco = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (!userId || !addressId || items.length === 0) {
      onError?.('Faltan datos para procesar el pago');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call backend to create payment session
      const response = await api.post('/payments/create-session', {
        userId,
        addressId,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        notes,
      });

      const { success, orderId, epaycoData } = response.data;

      if (!success || !epaycoData) {
        throw new Error('Error al crear la sesión de pago');
      }

      // Notify parent that order was created
      onOrderCreated?.(orderId);

      // 2. Create hidden form and submit to ePayco
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = EPAYCO_CHECKOUT_URL;
      form.style.display = 'none';

      // Add all ePayco fields as hidden inputs
      Object.entries(epaycoData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      // Append form to body and submit
      document.body.appendChild(form);
      form.submit();

      // Form submission will redirect, but cleanup just in case
      setTimeout(() => {
        if (document.body.contains(form)) {
          document.body.removeChild(form);
        }
      }, 5000);

    } catch (error: unknown) {
      console.error('Error creating ePayco session:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        'Error al procesar el pago con ePayco';
      onError?.(errorMessage);
      setIsLoading(false);
    }
  }, [userId, addressId, items, notes, onError, onOrderCreated]);

  return (
    <Button
      type="button"
      onClick={handlePayWithEpayco}
      className="w-full bg-[#009EE3] hover:bg-[#0080B8] text-white"
      size="lg"
      disabled={disabled || isLoading || !addressId || items.length === 0}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Conectando con ePayco...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pagar con ePayco - ${totalPrice.toLocaleString('es-CO')} COP
        </>
      )}
    </Button>
  );
}
