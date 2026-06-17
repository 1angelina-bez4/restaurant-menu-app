import TextField from "@mui/material/TextField";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

export default function CreateProductDialog({
  open,
  onClose,
  newProduct,
  setNewProduct,
  onSave,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
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
        />
        <TextField
          fullWidth
          margin="normal"
          label="Вес (граммы)"
          type="number"
          value={newProduct.weight}
          onChange={(e) =>
            setNewProduct({
              ...newProduct,
              weight: e.target.value,
            })
          }
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
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpenCreateProduct(false)}>
          Отмена
        </Button>


        <Button
          variant="contained"
          onClick={onSave}
        >
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
}