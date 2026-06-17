import { useState } from "react";
import { supabase } from "../supabaseClient";

export function useProducts() {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*");

    setProducts(data || []);
  };

  const deleteProduct = async (id) => {
    await supabase
      .from("products")
      .delete()
      .eq("id", id);

    setProducts((prev) =>
      prev.filter((p) => p.id !== id)
    );
  };

  return {
    products,
    setProducts,
    loadProducts,
    deleteProduct,
  };
}