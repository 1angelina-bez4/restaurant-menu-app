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
  ingredients,
}) {
  if (!selectedDish) return null;

  const totalWeight =
    ingredients.reduce(
      (sum, item) => sum + item.amount,
      0
    ) || 0;

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
            boxShadow:
              "0 25px 60px rgba(0,0,0,0.55)",
            borderRadius: "24px",
            overflow: "hidden",
          },
        },
      }}
    >
      <CardMedia
        component="img"
        height="250"
        image={selectedDish.image_url}
        alt={selectedDish.name}
      />

      <DialogTitle
        sx={{
          fontSize: "2rem",
          fontWeight: 700,
        }}
      >
        {selectedDish.name}
      </DialogTitle>

      <DialogContent>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            mb: 3,
          }}
        >
          {selectedDish.description}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "#ff9d4d",
            mb: 2,
            fontWeight: 700,
          }}
        >
          Состав
        </Typography>

        {ingredients.map((item) => (
          <Box
            key={item.products.id}
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
            <Typography>
              {item.products.name}
            </Typography>

            <Typography color="#ff9d4d">
              {item.amount} г
            </Typography>
          </Box>
        ))}

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 3,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            Общий вес: {totalWeight} г
          </Typography>

          <Typography
            sx={{
              color: "#ff9d4d",
              fontSize: "1.6rem",
              fontWeight: 700,
            }}
          >
            {selectedDish.price} ₽
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
}