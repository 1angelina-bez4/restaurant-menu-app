import DishDetailsDialog from "./DishDetailsDialog";
import EditProductDialog from "./EditProductDialog";
import CreateProductDialog from "./CreateProductDialog";
import CreateDishDialog from "./CreateDishDialog";
import RecipeDialog from "./RecipeDialog";
import EditDishPriceDialog from "./EditDishPriceDialog";

export default function MenuDialogs({
  // DishDetails
  openDetails,
  setOpenDetails,
  selectedDish,
  ingredients,
  totalWeight,

  // EditProduct
  openEditProduct,
  setOpenEditProduct,
  editingProduct,
  setEditingProduct,
  handleSaveProduct,

  // CreateProduct
  openCreateProduct,
  setOpenCreateProduct,
  newProduct,
  setNewProduct,
  handleCreateProduct,

  // CreateDish
  openCreateDish,
  setOpenCreateDish,
  newDish,
  setNewDish,
  handleCreateDish,

  // RecipeDialog (добавить)
  openRecipeDialog,
  setOpenRecipeDialog,
  selectedRecipeDish,

  // EditDishPrice (добавить)
  openEditDishPrice,
  setOpenEditDishPrice,
  editingDish,
  setEditingDish,
  handleSaveDishPrice,
}) {
  return (
    <>
      <DishDetailsDialog
        open={openDetails}
        onClose={() => setOpenDetails(false)}
        selectedDish={selectedDish}
        ingredients={ingredients}
        totalWeight={totalWeight}
      />

      <EditProductDialog
        open={openEditProduct}
        onClose={() => setOpenEditProduct(false)}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        onSave={handleSaveProduct}
      />

      <CreateProductDialog
        open={openCreateProduct}
        onClose={() => setOpenCreateProduct(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        onSave={handleCreateProduct}
      />

      <CreateDishDialog
        open={openCreateDish}
        onClose={() => setOpenCreateDish(false)}
        newDish={newDish}
        setNewDish={setNewDish}
        onSave={handleCreateDish}
      />

      {/* ✅ ДОБАВЛЯЕМ RecipeDialog */}
      <RecipeDialog
        open={openRecipeDialog}
        onClose={() => setOpenRecipeDialog(false)}
        dish={selectedRecipeDish}
        ingredients={ingredients} // если нужно
      />

      {/* ✅ ДОБАВЛЯЕМ EditDishPriceDialog */}
      <EditDishPriceDialog
        open={openEditDishPrice}
        onClose={() => setOpenEditDishPrice(false)}
        editingDish={editingDish}
        setEditingDish={setEditingDish}
        onSave={handleSaveDishPrice}
      />
    </>
  );
}