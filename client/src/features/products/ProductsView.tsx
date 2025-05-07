import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getProducts } from "./productService";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const ProductsView: React.FC = () => {
  const { role } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} isEditable={role === "employee"} />
      ))}
    </div>
  );
};

export default ProductsView;
