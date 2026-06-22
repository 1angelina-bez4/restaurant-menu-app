import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";

export default function DishCard({
  dish,
  roleId,
  onDetails,
  onDelete,
  onEditRecipe,
  onEditPrice,
  onAddToOrder,
}) {
  const isAdmin = roleId === 2;
  const isManager = roleId === 1;
  const isChef = roleId === 4;

  return (
    <Card
      sx={{
        maxWidth: 340,
        height: 560, // ← фиксированная высота
        borderRadius: 4,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg,#2a1814 0%,#1a0f0c 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "0.3s",
        },
      }}
    >
      <CardMedia
        component="img"
        height="160"
        image={dish.image_url}
        alt={dish.name}
        sx={{ flexShrink: 0 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          pb: 1,
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#fff",
            mb: 0.5,
            height: 56,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {dish.name}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            mb: 1,
            height: 60,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {dish.description}
        </Typography>

        <Typography
          sx={{
            color: "#fff",
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          Общий вес: {dish.totalWeight || 0} г
        </Typography>

        <Typography
          sx={{
            color: "#ff9d4d",
            fontWeight: 700,
            fontSize: "1.2rem",
            mb: 0.5,
          }}
        >
          {dish.price} ₽
        </Typography>

        <Box sx={{ mt: "auto", width: "100%" }}>
          {isManager && onAddToOrder && (
            <Button
              fullWidth
              variant="contained"
              sx={{
                mb: 0.5,
                background: "#b65c20",
                "&:hover": { background: "#cc6c2c" },
              }}
              onClick={() => onAddToOrder(dish)}
            >
              Добавить
            </Button>
          )}

          {isAdmin && (
            <>
              <Button
                fullWidth
                variant="contained"
                color="error"
                sx={{ mb: 0.5 }}
                onClick={() => onDelete(dish.id)}
              >
                Удалить
              </Button>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  mb: 0.5,
                  background: "#b65c20",
                  "&:hover": { background: "#cc6c2c" },
                }}
                onClick={() => onEditPrice(dish)}
              >
                Изменить цену
              </Button>
            </>
          )}

          {isChef && (
            <Button
              fullWidth
              variant="contained"
              sx={{
                mb: 0.5,
                background: "#b65c20",
                "&:hover": { background: "#cc6c2c" },
              }}
              onClick={() => onEditRecipe(dish)}
            >
              Состав блюда
            </Button>
          )}

          <Button
            fullWidth
            variant="outlined"
            onClick={() => onDetails(dish)}
            sx={{
              borderColor: "rgba(255,255,255,0.3)",
              color: "#fff",
              "&:hover": {
                borderColor: "#ff9d4d",
                color: "#ff9d4d",
              },
            }}
          >
            Подробнее
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}