import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function RecipeDialog({
  open,
  onClose,
  dish,
  loadDishes,
}) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] =
    useState("");
  const [amount, setAmount] = useState("");

  const [recipeIngredients, setRecipeIngredients] =
    useState([]);

  const fieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#fff",
      borderRadius: 3,

      "& fieldset": {
        borderColor: "rgba(255,255,255,0.08)",
      },

      "&:hover fieldset": {
        borderColor: "#ff9d4d",
      },

      "&.Mui-focused fieldset": {
        borderColor: "#ff9d4d",
      },
    },

    "& .MuiInputLabel-root": {
      color: "rgba(255,255,255,0.7)",
    },

    "& .MuiInputLabel-root.Mui-focused": {
      color: "#ff9d4d",
    },

    "& .MuiInputBase-input": {
      color: "#fff",
    },
  };

  const loadRecipe = async () => {
    if (!dish) return;

    const { data, error } = await supabase
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

    setRecipeIngredients(data || []);
  };

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .order("name");

      setProducts(data || []);
    }

    if (open && dish) {
      loadProducts();
      loadRecipe();
    }
  }, [open, dish]);

  const handleAddIngredient = async () => {
    if (
      !selectedProduct ||
      !amount ||
      !dish
    ) {
      return;
    }

    const { error } = await supabase
      .from("dish_products")
      .insert([
        {
          dish_id: dish.id,
          product_id: selectedProduct,
          amount: Number(amount),
        },
      ]);

    if (error) {
      console.error(error);
      return;
    }

    await loadRecipe();

    if (loadDishes) {
      await loadDishes();
    }

    setSelectedProduct("");
    setAmount("");
  };

  if (!dish) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background:
              "linear-gradient(180deg,#2a1814 0%,#1a0f0c 100%)",
            borderRadius: 4,
            border:
              "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "2rem",
        }}
      >
        Состав блюда
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: "#ffb06b",
            fontWeight: 600,
          }}
        >
          {dish.name}
        </Typography>

        {recipeIngredients.length > 0 ? (
          recipeIngredients.map((item) => (
            <Box
              key={item.products?.id}
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                py: 1.5,
                borderBottom:
                  "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography color="#fff">
                {item.products?.name}
              </Typography>

              <Typography
                sx={{
                  color:
                    "rgba(255,255,255,0.7)",
                }}
              >
                {item.amount} г
              </Typography>
            </Box>
          ))
        ) : (
          <Typography
            sx={{
              color:
                "rgba(255,255,255,0.6)",
            }}
          >
            Ингредиенты пока не добавлены
          </Typography>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography
            sx={{
              mb: 1,
              color: "#ffb06b",
              fontWeight: 600,
            }}
          >
            Добавить продукт
          </Typography>

          <Select
            fullWidth
            value={selectedProduct}
            onChange={(e) =>
              setSelectedProduct(
                e.target.value
              )
            }
            sx={{
              mb: 2,
              color: "#fff",
              borderRadius: 3,

              "& .MuiOutlinedInput-notchedOutline":
                {
                  borderColor:
                    "rgba(255,255,255,0.08)",
                },

              "&:hover .MuiOutlinedInput-notchedOutline":
                {
                  borderColor:
                    "#ff9d4d",
                },

              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                {
                  borderColor:
                    "#ff9d4d",
                },

              "& .MuiSvgIcon-root": {
                color: "#fff",
              },
            }}
          >
            {products.map((product) => (
              <MenuItem
                key={product.id}
                value={product.id}
              >
                {product.name}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Количество (г)"
            type="number"
            value={amount}
            sx={fieldStyles}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            color:
              "rgba(255,255,255,0.7)",
          }}
        >
          Закрыть
        </Button>

        <Button
          variant="contained"
          onClick={handleAddIngredient}
          sx={{
            background: "#b65c20",
            borderRadius: 3,
            px: 4,

            "&:hover": {
              background: "#cc6c2c",
            },
          }}
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}