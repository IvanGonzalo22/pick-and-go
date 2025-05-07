import React, { useState } from "react";
import PaymentModal from "./PaymentModal";
import ConfirmationModal from "./ConfirmationModal";

const CartView: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handlePay = () => {
    setShowPayment(false);
    setShowConfirmation(true);
  };

  return (
    <div>
      <h1>Tu carrito</h1>
      <button onClick={() => setShowPayment(true)}>Ir a pago</button>

      {showPayment && (
        <PaymentModal
          onConfirm={handlePay}
          onCancel={() => setShowPayment(false)}
        />
      )}
      {showConfirmation && (
        <ConfirmationModal onClose={() => setShowConfirmation(false)} />
      )}
    </div>
  );
};

export default CartView;
