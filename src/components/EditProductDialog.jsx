import TextField from "@mui/material/TextField";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export default function EditProductDialog({
  open,
  onClose,
  editingProduct,
  setEditingProduct,
  onSave,
}) {
  if (!editingProduct) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Редактирование продукта
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Название"
          value={editingProduct.name || ""}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              name: e.target.value,
            })
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="Калории"
          type="number"
          value={editingProduct.calories || ""}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              calories: e.target.value,
            })
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="Цена"
          type="number"
          value={editingProduct.price || ""}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              price: e.target.value,
            })
          }
        />

        <TextField
          fullWidth
          margin="normal"
          label="URL картинки"
          value={editingProduct.image_url || ""}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              image_url: e.target.value,
            })
          }
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={onSave}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}