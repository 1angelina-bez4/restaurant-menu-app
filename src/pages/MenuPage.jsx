import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";

export default function MenuPage() {
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("dishes");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: dishesData } = await supabase
        .from("dishes")
        .select("*");

      const { data: productsData } = await supabase
        .from("products")
        .select("*");

      setDishes(dishesData || []);
      setProducts(productsData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
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
      {/* Левое меню */}
      <Box
        sx={{
          width: 260,
          borderRight: "1px solid rgba(255,255,255,0.1)",
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 4,
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Restaurant
        </Typography>

        <Stack spacing={2}>
          <Button
            variant={selected === "dishes" ? "contained" : "outlined"}
            onClick={() => setSelected("dishes")}
          >
            🍽 Блюда
          </Button>

          <Button
            variant={selected === "products" ? "contained" : "outlined"}
            onClick={() => setSelected("products")}
          >
            🥬 Продукты
          </Button>
        </Stack>
      </Box>

      {/* Правая часть */}
      <Box
        sx={{
          flex: 1,
          p: 4,
          overflowY: "auto",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 700,
          }}
        >
          {selected === "dishes"
            ? "Меню ресторана"
            : "Склад продуктов"}
        </Typography>

       <Grid container spacing={3}>
  {dishes.map((dish) => (
    <Grid item xs={12} sm={6} md={4} key={dish.id}>
      <Card
        sx={{
          height: "100%",
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "#0b0d14",
        }}
      >
        <CardMedia
          component="img"
          height="220"
          image={
            dish.image_url ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
          }
          alt={dish.name}
        />

        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {dish.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {dish.description}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
          >
            <Typography>
              {dish.weight} г
            </Typography>

            <Typography
              color="primary"
              fontWeight="bold"
            >
              {dish.price} ₽
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
      </Box>
    </Box>
  );
}