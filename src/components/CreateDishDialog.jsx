import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

export default function CreateDishDialog({
  open,
  onClose,
  newDish,
  setNewDish,
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
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "#fff",
          fontWeight: 700,
          fontSize: "2rem",
        }}
      >
        Создание блюда
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Название"
          value={newDish.name}
          sx={fieldStyles}
          onChange={(e) =>
            setNewDish({
              ...newDish,
              name: e.target.value,
            })
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="Описание"
          multiline
          rows={3}
          value={newDish.description}
          sx={fieldStyles}
          onChange={(e) =>
            setNewDish({
              ...newDish,
              description: e.target.value,
            })
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="Цена"
          type="number"
          value={newDish.price}
          sx={fieldStyles}
          onChange={(e) =>
            setNewDish({
              ...newDish,
              price: e.target.value,
            })
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="URL картинки"
          value={newDish.image_url}
          sx={fieldStyles}
          onChange={(e) =>
            setNewDish({
              ...newDish,
              image_url: e.target.value,
            })
          }
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