import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import DishCard from "../components/DishCard";
import DishDetailsDialog from "../components/DishDetailsDialog";
import ProductCard from "../components/ProductCard";
import OrdersGrid from "../components/OrdersGrid";
import OrderCheckoutModal from "../components/OrderCheckoutModal";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditProductDialog from "../components/EditProductDialog";
import CreateProductDialog from "../components/CreateProductDialog";
import CreateDishDialog from "../components/CreateDishDialog";
import { useDishes } from "../hooks/useDishes";
import { useOrders } from "../hooks/useOrders";
import RecipeDialog from "../components/RecipeDialog";
import EditDishPriceDialog from "../components/EditDishPriceDialog";
import AIChat from '../components/AIChat';
import {
  Box,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Stack,
} from "@mui/material";
import { Search, Sort, FilterList } from "@mui/icons-material";

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("dishes");
  const [loading, setLoading] = useState(true);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [selectedRecipeDish, setSelectedRecipeDish] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [userId, setUserId] = useState(null);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // 🔍 НОВЫЕ СОСТОЯНИЯ ДЛЯ ПОИСКА И ФИЛЬТРАЦИИ
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPrice, setFilterPrice] = useState("all"); // all, low, high
  const [filterCalories, setFilterCalories] = useState("all"); // all, low, high
  const [filteredDishes, setFilteredDishes] = useState([]);

  const {
    dishes,
    openDetails,
    setOpenDetails,
    selectedDish,
    ingredients,
    totalWeight,
    openDishDetails,
    loadDishes,
  } = useDishes();

  const {
    orders,
    loadOrders,
    addToOrder,
    removeFromOrder,
    updateOrderQuantity,
    createOrder,
  } = useOrders();

  const [roleId, setRoleId] = useState(null);

  const [openEditProduct, setOpenEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [openCreateDish, setOpenCreateDish] = useState(false);
  const [openPriceDialog, setOpenPriceDialog] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [openEditDishPrice, setOpenEditDishPrice] = useState(false);

  const [newDish, setNewDish] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });

  const [openCreateProduct, setOpenCreateProduct] = useState(false);

  const handleEditRecipe = (dish) => {
    setSelectedRecipeDish(dish);
    setOpenRecipeDialog(true);
  };

  const [newProduct, setNewProduct] = useState({
    name: "",
    weight: "",
    calories: "",
    price: "",
    created_at: "",
    image_url: "",
  });

  const handleEditDishPrice = (dish) => {
    setEditingDish({ ...dish });
    setOpenEditDishPrice(true);
  };

  const handleSaveDishPrice = async () => {
    const { data, error } = await supabase
      .from("dishes")
      .update({
        price: Number(editingDish.price),
      })
      .eq("id", editingDish.id)
      .select();

    if (error) {
      console.error(error);
      return;
    }

    await loadDishes();
    setOpenEditDishPrice(false);
  };

  const handleAddToOrder = async (dish) => {
    const success = await addToOrder(dish.id);
    if (success) {
      await loadOrders();
    }
  };

  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromOrder(cartItemId);
    } else {
      await updateOrderQuantity(cartItemId, newQuantity);
    }
    await loadOrders();
    setForceUpdateKey(prev => prev + 1);
  };

  const handleCheckout = async (orderData) => {
    const success = await createOrder(orderData);
    if (success) {
      setCheckoutOpen(false);
      await loadOrders();
    }
  };

  const refreshOrders = async () => {
    await loadOrders();
    setForceUpdateKey(prev => prev + 1);
  };
  const handleOrderUpdate = async () => {
  console.log('🔄 Обновляем заказы...');
  await loadOrders();
  setForceUpdateKey(prev => prev + 1);
};

  // 🔍 ФИЛЬТРАЦИЯ БЛЮД
  useEffect(() => {
    let result = [...dishes];

    // 1. Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(dish => 
        dish.name.toLowerCase().includes(query) ||
        dish.description?.toLowerCase().includes(query)
      );
    }

    // 2. Фильтр по цене
    if (filterPrice === "low") {
      result = result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filterPrice === "high") {
      result = result.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    // 3. Фильтр по калориям
    if (filterCalories === "low") {
      result = result.sort((a, b) => (a.calories || 0) - (b.calories || 0));
    } else if (filterCalories === "high") {
      result = result.sort((a, b) => (b.calories || 0) - (a.calories || 0));
    }

    setFilteredDishes(result);
  }, [dishes, searchQuery, filterPrice, filterCalories]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", user.id)
          .single();

        setRoleId(profile?.role_id);
      }

      const { data: productsData } = await supabase
        .from("products")
        .select("*");

      setProducts(productsData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  const handleEditProduct = (product) => {
    if (roleId !== 2 && roleId !== 4) return;

    setEditingProduct(product);
    setOpenEditProduct(true);
  };

  const handleSaveProduct = async () => {
    if (roleId !== 2 && roleId !== 4) return;

    const { error } = await supabase
      .from("products")
      .update({
        name: editingProduct.name,
        calories: editingProduct.calories,
        price: editingProduct.price,
        image_url: editingProduct.image_url,
      })
      .eq("id", editingProduct.id);

    if (error) {
      console.error(error);
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id ? editingProduct : p
      )
    );

    setOpenEditProduct(false);
  };

  const handleDeleteProduct = async (id) => {
    if (roleId !== 2 && roleId !== 4) return;

    if (!window.confirm("Удалить продукт?")) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreateProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: newProduct.name,
          weight: newProduct.weight,
          calories: newProduct.calories,
          price: newProduct.price,
          created_at: new Date().toISOString(),
          image_url: newProduct.image_url,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProducts((prev) => [...prev, data]);

    setNewProduct({
      name: "",
      weight: "",
      calories: "",
      price: "",
      image_url: "",
    });

    setOpenCreateProduct(false);
  };

  const handleDeleteDish = async (id) => {
    if (roleId !== 2) return;

    if (!window.confirm("Удалить блюдо?")) {
      return;
    }

    const { error } = await supabase
      .from("dishes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    await loadDishes();
  };

  const handleCreateDish = async () => {
    const { data, error } = await supabase
      .from("dishes")
      .insert([
        {
          name: newDish.name,
          description: newDish.description,
          price: newDish.price,
          image_url: newDish.image_url,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return;
    }

    await loadDishes();

    setNewDish({
      name: "",
      description: "",
      price: "",
      image_url: "",
    });

    setOpenCreateDish(false);
  };

  // 🔍 Очистка фильтров
  const clearFilters = () => {
    setSearchQuery("");
    setFilterPrice("all");
    setFilterCalories("all");
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(180deg, #2a1f1a 0%, #1a0f0c 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#b65c20" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        background: "linear-gradient(180deg, #2a1f1a 0%, #1a0f0c 100%)",
        color: "#fff",
      }}
    >
      <Sidebar selected={selected} onChange={setSelected} roleId={roleId} />

      <Box
        sx={{
          flex: 1,
          p: 4,
          overflowY: "auto",
          background: "linear-gradient(180deg, #2a1f1a 0%, #1a0f0c 100%) !important",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            mb: 4,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {selected === "dishes"
            ? "Меню ресторана"
            : selected === "orders"
            ? "Мои заказы"
            : "Склад продуктов"}
        </Typography>

        {selected === "dishes" && (
          <>
            {/* 🔍 Панель поиска и фильтров */}
            <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              {/* Поиск */}
              <TextField
                placeholder="Поиск блюд..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                  },
                }}
                slotProps={{  
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Фильтр по цене */}
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Цена</InputLabel>
                <Select
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(e.target.value)}
                  sx={{
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="all">Все цены</MenuItem>
                  <MenuItem value="low">Сначала дешевле</MenuItem>
                  <MenuItem value="high">Сначала дороже</MenuItem>
                </Select>
              </FormControl>

              {/* Фильтр по калориям */}
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Калории</InputLabel>
                <Select
                  value={filterCalories}
                  onChange={(e) => setFilterCalories(e.target.value)}
                  sx={{
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
                    '& .MuiSvgIcon-root': { color: 'rgba(255,255,255,0.7)' },
                  }}
                >
                  <MenuItem value="all">Все калории</MenuItem>
                  <MenuItem value="low">Сначала меньше</MenuItem>
                  <MenuItem value="high">Сначала больше</MenuItem>
                </Select>
              </FormControl>

              {/* Кнопка сброса фильтров */}
              {(searchQuery || filterPrice !== "all" || filterCalories !== "all") && (
                <Chip
                  label="Сбросить фильтры"
                  onClick={clearFilters}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                  variant="outlined"
                />
              )}
            </Box>

            {/* Информация о количестве блюд */}
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
              Найдено: {filteredDishes.length} блюд
            </Typography>
          </>
        )}

        {selected === "dishes" ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                roleId={roleId}
                onDetails={openDishDetails}
                onDelete={handleDeleteDish}
                onEditRecipe={handleEditRecipe}
                onEditPrice={handleEditDishPrice}
                onAddToOrder={handleAddToOrder}
              />
            ))}

            {/* Если нет результатов */}
            {filteredDishes.length === 0 && (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 8 }}>
                <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  🔍 Ничего не найдено
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', mt: 1 }}>
                  Попробуйте изменить параметры поиска или сбросить фильтры
                </Typography>
              </Box>
            )}
          </Box>
        ) : selected === "orders" ? (
          <OrdersGrid
            key={forceUpdateKey}
            orders={orders}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={() => setCheckoutOpen(true)}
          />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                roleId={roleId}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </Box>
        )}

        <DishDetailsDialog
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          selectedDish={selectedDish}
          ingredients={ingredients}
          totalWeight={totalWeight}
        />

        <EditProductDialog
          open={openEditProduct}
          onClose={() => setOpenEditProduct(false)}
          editingProduct={editingProduct}
          setEditingProduct={setEditingProduct}
          onSave={handleSaveProduct}
        />

        <CreateProductDialog
          open={openCreateProduct}
          onClose={() => setOpenCreateProduct(false)}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
          onSave={handleCreateProduct}
        />

        <CreateDishDialog
          open={openCreateDish}
          onClose={() => setOpenCreateDish(false)}
          newDish={newDish}
          setNewDish={setNewDish}
          onSave={handleCreateDish}
        />

        <RecipeDialog
          open={openRecipeDialog}
          onClose={() => setOpenRecipeDialog(false)}
          dish={selectedRecipeDish}
          loadDishes={loadDishes}
        />

        <EditDishPriceDialog
          open={openEditDishPrice}
          onClose={() => setOpenEditDishPrice(false)}
          dish={editingDish}
          setDish={setEditingDish}
          onSave={handleSaveDishPrice}
        />

        <OrderCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          onConfirm={handleCheckout}
          total={orders.reduce(
            (sum, item) => sum + (item.dishes?.price || 0) * item.quantity,
            0
          )}
          items={orders.map((item) => ({
            dish: item.dishes,
            quantity: item.quantity,
          }))}
        />

        {(roleId === 1 || roleId === 2) && !showChat && (
          <Fab
            sx={{
              position: "fixed",
              bottom: 100,
              right: 30,
              background: "#b65c20",
              "&:hover": { background: "#cc6c2c" },
            }}
            onClick={() => setShowChat(true)}
          >
            💬
          </Fab>
        )}

        {(roleId === 2 || roleId === 4) && (
          <Fab
            sx={{
              position: "fixed",
              bottom: 30,
              right: 30,
              background: "#b65c20",
              "&:hover": { background: "#cc6c2c" },
            }}
            onClick={() => {
              if (selected === "products") {
                setOpenCreateProduct(true);
              } else if (selected === "dishes") {
                setOpenCreateDish(true);
              }
            }}
          >
            <AddIcon />
          </Fab>
        )}
        {showChat && userId && (
          <AIChat 
            userId={userId} 
            agentId="a0c15523-fedd-4bbd-a42a-5437fc832d3c" 
            onClose={() => {
              setShowChat(false);
              handleOrderUpdate();
            }}
             onOrderUpdate={handleOrderUpdate} 
          />
        )}
      </Box>
    </Box>
  );
}