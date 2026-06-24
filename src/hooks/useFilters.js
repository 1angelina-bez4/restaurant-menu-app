import { useState, useEffect } from "react";

export function useFilters(dishes) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrice, setFilterPrice] = useState("all");
  const [filterCalories, setFilterCalories] = useState("all");
  const [filteredDishes, setFilteredDishes] = useState([]);

  useEffect(() => {
    let result = [...dishes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (dish) =>
          dish.name.toLowerCase().includes(query) ||
          dish.description?.toLowerCase().includes(query)
      );
    }

    if (filterPrice === "low") {
      result = result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filterPrice === "high") {
      result = result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    if (filterCalories === "low") {
      result = result.sort((a, b) => (a.calories || 0) - (b.calories || 0));
    } else if (filterCalories === "high") {
      result = result.sort((a, b) => (b.calories || 0) - (a.calories || 0));
    }

    setFilteredDishes(result);
  }, [dishes, searchQuery, filterPrice, filterCalories]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterPrice("all");
    setFilterCalories("all");
  };

  return {
    searchQuery,
    setSearchQuery,
    filterPrice,
    setFilterPrice,
    filterCalories,
    setFilterCalories,
    filteredDishes,
    clearFilters,
  };
}