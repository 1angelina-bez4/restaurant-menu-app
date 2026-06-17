import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useDishes() {
  const [dishes, setDishes] = useState([]);
  const [openDetails, setOpenDetails] =
    useState(false);

  const [selectedDish, setSelectedDish] =
    useState(null);

  const [ingredients, setIngredients] =
    useState([]);

  const [totalWeight, setTotalWeight] =
    useState(0);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const { data: dishesData } =
      await supabase
        .from("dishes")
        .select("*");

    const { data: dishProducts } =
      await supabase
        .from("dish_products")
        .select("dish_id, amount");

    const weightMap = {};

    dishProducts?.forEach((item) => {
      weightMap[item.dish_id] =
        (weightMap[item.dish_id] || 0) +
        item.amount;
    });

    const dishesWithWeight =
      dishesData?.map((dish) => ({
        ...dish,
        totalWeight:
          weightMap[dish.id] || 0,
      })) || [];

    setDishes(dishesWithWeight);
  };

  const openDishDetails = async (dish) => {
    setSelectedDish(dish);

    const { data, error } =
      await supabase
        .from("dish_products")
        .select(`
          amount,
          products (
            id,
            name
          )
        `)
        .eq("dish_id", dish.id);

    if (error) {
      console.error(error);
      return;
    }

    setIngredients(data || []);

    const total =
      data?.reduce(
        (sum, item) =>
          sum + item.amount,
        0
      ) || 0;

    setTotalWeight(total);

    setOpenDetails(true);
  };

  return {
    dishes,

    openDetails,
    setOpenDetails,

    selectedDish,

    ingredients,

    totalWeight,

    openDishDetails,

    loadDishes,
  };
}