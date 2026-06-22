// OrderItem.jsx
import {
  Box,
  Typography,
  ButtonGroup,
  Button,
} from "@mui/material";
import {
  Add,
  Remove,
} from "@mui/icons-material";

export default function OrderItem({
  dish,
  quantity,
  onIncrease,
  onDecrease,
}) {
  // Безопасное получение данных с значениями по умолчанию
  const dishName = dish?.name || "Блюдо";
  const dishPrice = dish?.price || 0;
  const dishWeight = dish?.totalWeight || 0;

  // Безопасная обработка кликов
  const handleDecrease = () => {
    if (onDecrease && typeof onDecrease === 'function') {
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (onIncrease && typeof onIncrease === 'function') {
      onIncrease();
    }
  };

  const safeQuantity = quantity || 1;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        px: 2,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      {/* Левая часть: название + цена за порцию */}
      <Box sx={{ flex: 1, minWidth: 140 }}>
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.95rem",
          }}
        >
          {dishName}
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.8rem",
          }}
        >
          {dishWeight > 0 ? `${dishWeight} г · ` : ""}{dishPrice} ₽
        </Typography>
      </Box>

      {/* Центральная часть: количество порций */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          minWidth: 100,
        }}
      >
        <ButtonGroup
          size="small"
          sx={{
            "& .MuiButton-root": {
              color: "#fff",
              borderColor: "rgba(255,255,255,0.2)",
              "&:hover": {
                borderColor: "#ff9d4d",
                color: "#ff9d4d",
              },
            },
          }}
        >
          <Button onClick={handleDecrease}>
            <Remove fontSize="small" />
          </Button>
          <Button
            disabled
            sx={{
              minWidth: 36,
              color: "#fff !important", // ← принудительно белый цвет
              fontWeight: 600,
            }}
          >
            {safeQuantity}
          </Button>
          <Button onClick={handleIncrease}>
            <Add fontSize="small" />
          </Button>
        </ButtonGroup>
      </Box>

      {/* Правая часть: общая цена */}
      <Box
        sx={{
          flex: 1,
          minWidth: 80,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          sx={{
            color: "#ff9d4d",
            fontWeight: 700,
            fontSize: "0.95rem",
          }}
        >
          {(dishPrice * safeQuantity).toFixed(0)} ₽
        </Typography>
      </Box>
    </Box>
  );
}