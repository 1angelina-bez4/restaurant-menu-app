import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";

export default function ProductCard({
    product,
    roleId,
    onEdit,
    onDelete,
}) {
  return (
    <Card
      sx={{
        borderRadius: 4,

        background:
          "linear-gradient(180deg,#2a1814 0%,#1a0f0c 100%)",

        border:
          "1px solid rgba(255,255,255,0.08)",

        color: "#fff",

        transition: "0.3s",

        "&:hover": {
          transform: "translateY(-4px)",
        },
      }}
    >
        <CardMedia
            component="img"
            height="160"
            image={product.image_url}
            alt={product.name}
            />
      <CardContent>
        
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: 2,
          }}
        >
          {product.name}
        </Typography>

        <Typography
          sx={{
            color: "rgba(255,255,255,0.7)",
            mb: 1,
          }}
        >
          Калории: {product.calories}
        </Typography>

        <Typography
          sx={{
            color: "#ff9d4d",
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          {product.price} ₽
        </Typography>
      </CardContent>
      {(roleId === 2 || roleId === 4) && (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
            fullWidth
            variant="contained"
            onClick={() => onEdit(product)}
            >
            Изменить
            </Button>

            <Button
            fullWidth
            color="error"
            variant="contained"
            onClick={() => onDelete(product.id)}
            >
            Удалить
            </Button>
        </Stack>
        )}
    </Card>
  );
}