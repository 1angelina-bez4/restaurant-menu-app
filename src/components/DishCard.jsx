import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";

export default function DishCard({
  dish,
  roleId,
  onDetails,
  onDelete,
  onEditRecipe,
}) {
  return (
    <Card
      sx={{
        maxWidth: 340,
        borderRadius: 4,
        overflow: "hidden",
        background:
          "linear-gradient(180deg,#2a1814 0%,#1a0f0c 100%)",
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
      />

      <CardContent>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: "#fff",
            mb: 1,
          }}
        >
          {dish.name}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            mb: 2,
            minHeight: 60,
          }}
        >
          {dish.description}
        </Typography>

        <Typography
          sx={{
            color: "#fff",
            fontWeight: 600,
            mb: 1,
          }}
        >
          Общий вес: {dish.totalWeight} г
        </Typography>

        <Typography
          sx={{
            color: "#ff9d4d",
            fontWeight: 700,
            fontSize: "1.4rem",
            mb: 2,
          }}
        >
          {dish.price} ₽
        </Typography>

        {roleId === 2 && (
        <Button
          fullWidth
          variant="contained"
          color="error"
          sx={{ mb: 1 }}
          onClick={() => onDelete(dish.id)}
        >
          Удалить
        </Button>
      )}

      {roleId === 4 && (
        <Button
          fullWidth
          variant="contained"
          sx={{
            mb: 1,
            background: "#b65c20",

            "&:hover": {
              background: "#cc6c2c",
            },
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
        >
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
}