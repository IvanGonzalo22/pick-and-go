import React from "react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<Props> = ({ onConfirm, onCancel }) => (
  <div>
    <h2>Pasarela de pago</h2>
    <button onClick={onConfirm}>Confirmar</button>
    <button onClick={onCancel}>Cancelar</button>
  </div>
);

export default PaymentModal;
