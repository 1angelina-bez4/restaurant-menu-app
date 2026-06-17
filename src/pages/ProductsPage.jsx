import { useState } from "react";
import CreateProductDialog from "./CreateProductDialog";
import ProductCard from "./ProductCard";

export default function ProductsPage({ roleId }) {
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    weight: "",
    calories: "",
    price: "",
    image_url: "",
  });

  const handleSaveProduct = () => {
    const productWithId = {
      ...newProduct,
      id: Date.now(), // временный ID
    };

    setProducts([...products, productWithId]); // добавляем в список
    setDialogOpen(false); // закрываем диалог

    // очищаем форму
    setNewProduct({
      name: "",
      weight: "",
      calories: "",
      price: "",
      image_url: "",
    });
  };

  return (
    <>
      <Button variant="contained" onClick={() => setDialogOpen(true)}>
        Добавить продукт
      </Button>

      <CreateProductDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        onSave={handleSaveProduct}
      />

      {/* Отрисовка карточек */}
      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, 250px)",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            roleId={roleId}
            onEdit={(p) => console.log("edit", p)}
            onDelete={(id) =>
              setProducts(products.filter((p) => p.id !== id))
            }
          />
        ))}
      </div>
    </>
  );
}
