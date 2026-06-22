// components/OrderCheckoutModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useState } from "react";

export default function OrderCheckoutModal({
  open,
  onClose,
  onConfirm,
  total,
  items,
}) {
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!address.trim() || !phone.trim()) {
      alert("Пожалуйста, укажите адрес и телефон");
      return;
    }

    setLoading(true);
    const success = await onConfirm({
      address: address.trim(),
      phone: phone.trim(),
      comment: comment.trim(),
    });
    setLoading(false);

    if (success) {
      setAddress("");
      setPhone("");
      setComment("");
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: "#1a0f0c",
            color: "#fff",
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
        🍽️ Оформление заказа
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 1 }}>
            Ваш заказ:
          </Typography>
          {items.map((item) => (
            <Box
              key={item.dish.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.5,
                fontSize: "0.9rem",
              }}
            >
              <Typography>
                {item.dish.name} × {item.quantity}
              </Typography>
              <Typography sx={{ color: "#ff9d4d" }}>
                {(item.dish.price * item.quantity).toFixed(0)} ₽
              </Typography>
            </Box>
          ))}
          <Typography
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#ff9d4d",
              textAlign: "right",
            }}
          >
            Итого: {total.toFixed(0)} ₽
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Адрес доставки"
          placeholder="ул. Пушкина, д. 10, кв. 5"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          sx={{
            mb: 2,
            "& label": { color: "rgba(255,255,255,0.5)" },
            "& input": { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "#ff9d4d" },
            },
          }}
        />

        <TextField
          fullWidth
          label="Телефон"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          sx={{
            mb: 2,
            "& label": { color: "rgba(255,255,255,0.5)" },
            "& input": { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "#ff9d4d" },
            },
          }}
        />

        <TextField
          fullWidth
          label="Комментарий к заказу"
          placeholder="Без лука, позвонить перед доставкой..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          rows={2}
          sx={{
            "& label": { color: "rgba(255,255,255,0.5)" },
            "& textarea": { color: "#fff" },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
              "&:hover fieldset": { borderColor: "#ff9d4d" },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "rgba(255,255,255,0.5)",
            "&:hover": { color: "#fff" },
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: "#b65c20",
            color: "#fff",
            px: 4,
            "&:hover": { background: "#cc6c2c" },
            "&:disabled": { background: "rgba(255,255,255,0.1)" },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Заказать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}