import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";
import DishCard from "../components/DishCard";
import DishDetailsDialog from "../components/DishDetailsDialog";
import ProductCard from "../components/ProductCard";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditProductDialog from "../components/EditProductDialog";
import CreateProductDialog from "../components/CreateProductDialog";
import { useDishes } from "../hooks/useDishes";
import {
  Box,
  Typography,
} from "@mui/material";

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("dishes");
  const [loading, setLoading] = useState(true);

  const [roleId, setRoleId] = useState(null);

  const [openEditProduct, setOpenEditProduct] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [openCreateProduct, setOpenCreateProduct] =
    useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    weight: "",
    calories: "",
    price: "",
    created_at: "",
    image_url: "",
  });

  const {
    dishes,
    openDetails,
    setOpenDetails,
    selectedDish,
    ingredients,
    totalWeight,
    openDishDetails,
  } = useDishes();

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
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
      p.id === editingProduct.id
        ? editingProduct
        : p
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

    setProducts((prev) =>
      prev.filter((p) => p.id !== id)
    );
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

if (loading) {
  return (
    <Typography sx={{ p: 4 }}>
      Загрузка...
    </Typography>
  );
}
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        background:
          "radial-gradient(circle at center, #2a211d 0%, #141010 100%)",
        color: "#fff",
      }}
    >
      {/* Левая часть */}
      <Sidebar
        selected={selected}
        onChange={setSelected}
        roleId={roleId}
      />
      {/* Правая часть */}
      <Box
        sx={{
          flex: 1,
          p: 4,
          overflowY: "auto",
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
            : "Склад продуктов"}
        </Typography>

        {/* Карточки блюд */}
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
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onDetails={openDishDetails}
            />
          ))}
        </Box>
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
        {/* Модальное окно */}
        <DishDetailsDialog
        open={openDetails}
        onClose={() =>
          setOpenDetails(false)
        }
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
      </Box>
      {/* Кнопка создания продукта */}
      {selected === "products" &&
      (roleId === 2 || roleId === 4) && (
        <Fab
          color="primary"
          sx={{
            position: "fixed",
            bottom: 30,
            right: 30,
          }}
          onClick={(e) => {
            e.currentTarget.blur();
            setOpenCreateProduct(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
