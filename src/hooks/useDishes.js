import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export function useDishes() {
  const [dishes, setDishes] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const { data: dishesData } = await supabase
      .from("dishes")
      .select("*")
      .order("name", { ascending: true });

    setDishes(dishesData || []);
  };

  const openDishDetails = async (dish) => {
    setSelectedDish(dish);

    const { data, error } = await supabase
      .from("dish_products")
      .select(`
        amount,
        products (
          id,
          name,
          calories
        )
      `)
      .eq("dish_id", dish.id);

    if (error) {
      console.error(error);
      return;
    }

    setIngredients(data || []);

    const total = data?.reduce((sum, item) => sum + item.amount, 0) || 0;
    setTotalWeight(total);

    const calories = data?.reduce((sum, item) => {
      const caloriesPer100g = item.products?.calories || 0;
      const amount = item.amount || 0;
      return sum + (caloriesPer100g * amount) / 100;
    }, 0) || 0;
    setTotalCalories(Math.round(calories));

    setOpenDetails(true);
  };

  return {
    dishes,
    openDetails,
    setOpenDetails,
    selectedDish,
    ingredients,
    totalWeight,
    totalCalories,
    openDishDetails,
    loadDishes,
  };
}