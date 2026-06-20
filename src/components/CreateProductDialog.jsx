import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

export default function CreateProductDialog({
  open,
  onClose,
  newProduct,
  setNewProduct,
  onSave,
}) {
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
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
            boxShadow: "0 10px 40px rgba(0,0,0,.5)",
          },
        },
      }}
    >
  <DialogTitle
    sx={{
      color: "#fff",
      fontWeight: 700,
      fontSize: "2rem",
      pb: 1,
    }}
  >
    Создание продукта
  </DialogTitle>

  <DialogContent>
    <TextField
      fullWidth
      margin="normal"
      label="Название"
      value={newProduct.name}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          name: e.target.value,
        })
      }
      sx={fieldStyles}
    />

    <TextField
      fullWidth
      margin="normal"
      label="Вес (г)"
      type="number"
      value={newProduct.weight}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          weight: e.target.value,
        })
      }
      sx={fieldStyles}
    />

    <TextField
      fullWidth
      margin="normal"
      label="Калории"
      type="number"
      value={newProduct.calories}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          calories: e.target.value,
        })
      }
      sx={fieldStyles}
    />

    <TextField
      fullWidth
      margin="normal"
      label="Цена"
      type="number"
      value={newProduct.price}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          price: e.target.value,
        })
      }
      sx={fieldStyles}
    />

    <TextField
      fullWidth
      margin="normal"
      label="URL картинки"
      value={newProduct.image_url}
      onChange={(e) =>
        setNewProduct({
          ...newProduct,
          image_url: e.target.value,
        })
      }
      sx={fieldStyles}
    />
  </DialogContent>

  <DialogActions sx={{ p: 3 }}>
    <Button
      onClick={onClose}
      sx={{
        color: "rgba(255,255,255,0.7)",
      }}
    >
      Отмена
    </Button>

    <Button
      variant="contained"
      onClick={onSave}
      sx={{
        background: "#b65c20",
        borderRadius: 3,
        px: 4,

        "&:hover": {
          background: "#cc6c2c",
        },
      }}
    >
      Создать
    </Button>
  </DialogActions>
</Dialog>
  );
}