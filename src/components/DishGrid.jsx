import { Box } from "@mui/material";
import DishCard from "./DishCard";

export default function DishGrid({
  dishes,
  onDetails,
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
      {dishes.map((dish) => (
        <DishCard
          key={dish.id}
          dish={dish}
          onDetails={onDetails}
        />
      ))}
    </Box>
  );
}