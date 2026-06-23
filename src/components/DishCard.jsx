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
        height: "100%",
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
        height="180"
        image={dish.image_url}
        alt={dish.name}
        sx={{ flexShrink: 0 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 2.5,
        }}
      >
        {/* Название */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#fff",
            mb: 1,
            fontSize: "1.4rem",
            lineHeight: 1.3,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {dish.name}
        </Typography>

        {/* Описание */}
        <Typography
          sx={{
            color: "rgba(255,255,255,0.75)",
            mb: 2,
            fontSize: "1rem",
            lineHeight: 1.5,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {dish.description}
        </Typography>

        {/* Вес и калории */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 1,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.95rem",
            }}
          >
            ⚖️ {dish.totalweight || dish.totalWeight || 0} г
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.95rem",
            }}
          >
            🔥 {dish.calories || 0} ккал
          </Typography>
        </Box>

        {/* Цена */}
        <Typography
          sx={{
            color: "#ff9d4d",
            fontWeight: 800,
            fontSize: "1.6rem",
            mb: 2,
          }}
        >
          {dish.price} ₽
        </Typography>

        {/* Кнопки */}
        <Box
          sx={{
            mt: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {isManager && onAddToOrder && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => onAddToOrder(dish)}
              sx={{
                background: "#b65c20",
                "&:hover": {
                  background: "#cc6c2c",
                },
              }}
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
                onClick={() => onDelete(dish.id)}
              >
                Удалить
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={() => onEditPrice(dish)}
                sx={{
                  background: "#b65c20",
                  "&:hover": {
                    background: "#cc6c2c",
                  },
                }}
              >
                Изменить цену
              </Button>
            </>
          )}

          {isChef && (
            <Button
              fullWidth
              variant="contained"
              onClick={() => onEditRecipe(dish)}
              sx={{
                background: "#b65c20",
                "&:hover": {
                  background: "#cc6c2c",
                },
              }}
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
