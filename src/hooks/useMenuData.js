import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useMenuData() {
  const [products, setProducts] = useState([]);
  const [roleId, setRoleId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", user.id)
          .single();
        setRoleId(profile?.role_id);
      }
      const { data: productsData } = await supabase.from("products").select("*");
      setProducts(productsData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  return { products, setProducts, roleId, userId, loading };
}