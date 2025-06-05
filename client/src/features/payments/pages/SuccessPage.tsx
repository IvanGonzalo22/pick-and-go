// src/features/payments/pages/SuccessPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API } from '../../../common/utils/api';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || '';
  const nav = useNavigate();

  // 'loading' → intentando confirmar
  // 'success' → confirmación exitosa (o carrito vacío, ya hecho)
  // 'error'   → error de verdad
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // Este ref nos garantiza que solo hacemos la llamada una vez,
  // sin importar cuántas veces React montara/desmontara el efecto en DEV.
  const hasConfirmedRef = useRef(false);

  useEffect(() => {
    console.log('[SuccessPage] Montado con session_id =', sessionId);

    if (!sessionId) {
      setErrorMsg('No se encontró session_id en la URL.');
      setStatus('error');
      return;
    }

    // Si ya confirmamos una vez, no volvemos a hacerlo
    if (hasConfirmedRef.current) {
      console.log('[SuccessPage] confirmPayment ya se ejecutó, salgo.');
      return;
    }

    const confirmPayment = async () => {
      try {
        console.log('[SuccessPage] Llamando a /payments/confirm con sessionId:', sessionId);
        hasConfirmedRef.current = true; // marcamos que ya estamos confirmando
        await API.post<{ orderId: string }>('/payments/confirm', { sessionId });
        console.log('[SuccessPage] /payments/confirm respondió 200');
        setStatus('success');
      } catch (err: any) {
        const msg = err.response?.data?.error || 'Error al confirmar pago.';
        console.log('[SuccessPage] /payments/confirm respondió error:', msg);

        // Si el mensaje contiene "carrito está vacío", interpretamos que
        // la orden ya se procesó en la primera llamada, así que
        // lo tratamos como éxito:
        if (msg.includes('carrito está vacío')) {
          setStatus('success');
        } else {
          setErrorMsg(msg);
          setStatus('error');
        }
      }
    };

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 p-4">
        <p className="text-xl font-medium">Procesando tu pedido…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">
          ¡Algo salió mal!
        </h2>
        <p className="mb-6">{errorMsg}</p>
        <button
          onClick={() => nav('/cart')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Volver al carrito
        </button>
      </div>
    );
  }

  // status === 'success'
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h2 className="text-3xl font-semibold mb-4 text-green-600">
        ¡Pedido realizado con éxito!
      </h2>
      <p className="mb-6">
        Gracias por tu compra. Para ver tu histórico, pulsa abajo.
      </p>
      <button
        onClick={() => nav('/history')}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200"
      >
        Ver historial de pedidos
      </button>
    </div>
  );
}
