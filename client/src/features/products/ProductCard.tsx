import React from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

interface Props {
  product: Product;
  isEditable: boolean;
}

const ProductCard: React.FC<Props> = ({ product, isEditable }) => (
  <div  className="border">
    <h2>{product.name}</h2>
    <p>{product.price} €</p>
    {isEditable && <p>Stock disponible: {product.stock}</p>}
  </div>
);

export default ProductCard;
