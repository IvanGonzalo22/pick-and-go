import React from "react";

interface Props {
  onClose: () => void;
}

const ConfirmationModal: React.FC<Props> = ({ onClose }) => (
  <div>
    <h2>¡Pedido confirmado!</h2>
    <p>Gracias por tu compra.</p>
    <button onClick={onClose}>Cerrar</button>
  </div>
);

export default ConfirmationModal;
