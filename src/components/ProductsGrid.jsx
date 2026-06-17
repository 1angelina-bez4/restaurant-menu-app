import { Box } from "@mui/material";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products,
  roleId,
  onEdit,
  onDelete,
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 3,
      }}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          roleId={roleId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
}