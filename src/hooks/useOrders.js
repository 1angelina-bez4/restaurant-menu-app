import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        dishes (
          id,
          name,
          description,
          price,
          image_url
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.error("Ошибка загрузки заказов:", error);
      return;
    }

    setOrders([...(data || [])]);
  };

  const addToOrder = async (dishId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    // Проверяем, есть ли уже это блюдо в корзине
    const { data: existingItem, error: findError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", user.id)
      .eq("dish_id", dishId)
      .maybeSingle();

    if (findError && findError.code !== "PGRST116") {
      console.error("Ошибка проверки корзины:", findError);
      return false;
    }

    if (existingItem) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Ошибка обновления количества:", updateError);
        return false;
      }
    } else {
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert([
          {
            user_id: user.id,
            dish_id: dishId,
            quantity: 1,
          },
        ]);

      if (insertError) {
        console.error("Ошибка добавления в заказ:", insertError);
        return false;
      }
    }

    await loadOrders();
    return true;
  };

  const updateOrderQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      return await removeFromOrder(cartItemId);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Ошибка обновления количества:", error);
      return false;
    }

    await loadOrders();
    return true;
  };

  const removeFromOrder = async (cartItemId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Ошибка удаления из заказа:", error);
      return false;
    }

    await loadOrders();
    return true;
  };

  const createOrder = async (orderData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Пользователь не авторизован");
      return false;
    }

    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        dish_id,
        quantity,
        dishes (price)
      `)
      .eq("user_id", user.id);

    if (cartError) {
      console.error("Ошибка получения корзины:", cartError);
      return false;
    }

    if (!cartItems || cartItems.length === 0) {
      console.error("Корзина пуста");
      return false;
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + (item.dishes?.price || 0) * item.quantity,
      0
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.id,
          total_price: totalPrice,
          status: "Ожидает подтверждения",
          address: orderData.address,
          phone: orderData.phone,
          comment: orderData.comment || "",
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Ошибка создания заказа:", orderError);
      return false;
    }

    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      dish_id: item.dish_id,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Ошибка создания позиций заказа:", itemsError);
      return false;
    }

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Ошибка очистки корзины:", deleteError);
    }

    //Перезагружаем корзину
    await loadOrders();

    return true;
  };

  return {
    orders,
    loadOrders,
    addToOrder,
    updateOrderQuantity,
    removeFromOrder,
    createOrder,
  };
}