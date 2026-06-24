
import { Box, Typography, Button } from "@mui/material"; // ← добавить Button
import OrderItem from "./OrderItem";

export default function OrdersGrid({
  orders,
  onUpdateQuantity,
  onCheckout,
}) {
  if (!orders || orders.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <Typography variant="h6">Корзина пуста</Typography>
        <Typography variant="body2">Добавьте блюда из меню</Typography>
      </Box>
    );
  }

  const items = orders.map((item) => ({
    dish: item?.dishes || {},
    quantity: item?.quantity || 1,
    cartItemId: item?.id || Date.now(),
  }));

  const total = items.reduce(
    (sum, item) => sum + (item.dish?.price || 0) * item.quantity,
    0
  );

  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.03)",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          px: 2,
          py: 1.5,
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Блюдо
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            textAlign: "center",
          }}
        >
          Количество
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.8rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            textAlign: "right",
          }}
        >
          Сумма
        </Typography>
      </Box>

      {/* Список заказов */}
      {items.map((item) => (
        <OrderItem
          key={item.cartItemId}
          dish={item.dish}
          quantity={item.quantity}
          onIncrease={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
          onDecrease={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
        />
      ))}

      {/* Итог */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          px: 2,
          py: 2,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.8rem",
            }}
          >
            Итого
          </Typography>
          <Typography
            sx={{
              color: "#ff9d4d",
              fontWeight: 700,
              fontSize: "1.4rem",
            }}
          >
            {total.toFixed(0)} ₽
          </Typography>
        </Box>
      </Box>

      {/* Кнопка "Оформить заказ" */}
      {total > 0 && (
        <Box sx={{ p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onCheckout}
            sx={{
              background: "#b65c20",
              color: "#fff",
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 700,
              "&:hover": { background: "#cc6c2c" },
            }}
          >
            Оформить заказ
          </Button>
        </Box>
      )}
    </Box>
  );
}