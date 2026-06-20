import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CardMedia,
} from "@mui/material";

export default function DishDetailsDialog({
  open,
  onClose,
  selectedDish,
  ingredients = [], // ← значение по умолчанию
}) {
  if (!selectedDish) return null;

  // Безопасное вычисление общего веса
  const totalWeight = Array.isArray(ingredients)
    ? ingredients.reduce((sum, item) => sum + (item?.amount || 0), 0)
    : 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: "rgba(28,17,14,0.92)",
            backdropFilter: "blur(20px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.55)",
            borderRadius: "24px",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* Безопасное отображение изображения */}
      <CardMedia
        component="img"
        height="250"
        image={selectedDish.image_url || "/placeholder-image.jpg"}
        alt={selectedDish.name || "Блюдо"}
      />

      <DialogTitle sx={{ fontSize: "2rem", fontWeight: 700 }}>
        {selectedDish.name}
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          {selectedDish.description || "Описание отсутствует"}
        </Typography>

        <Typography variant="h6" sx={{ color: "#ff9d4d", mb: 2, fontWeight: 700 }}>
          Состав
        </Typography>

        {Array.isArray(ingredients) && ingredients.length > 0 ? (
          ingredients.map((item) => (
            <Box
              key={item?.products?.id || Math.random()}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                py: 1,
                px: 2,
                borderRadius: 2,
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <Typography>{item?.products?.name || "Неизвестный продукт"}</Typography>
              <Typography color="#ff9d4d">{item?.amount || 0} г</Typography>
            </Box>
          ))
        ) : (
          <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
            Ингредиенты не указаны
          </Typography>
        )}

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 3,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <Typography sx={{ fontWeight: 600 }}>
            Общий вес: {totalWeight} г
          </Typography>
          <Typography sx={{ color: "#ff9d4d", fontSize: "1.6rem", fontWeight: 700 }}>
            {selectedDish.price} ₽
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: "#fff" }}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}