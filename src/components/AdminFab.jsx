import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

export default function AdminFab({
  roleId,
  selected,
  setOpenCreateProduct,
  setOpenCreateDish,
}) {
  if (roleId !== 2 && roleId !== 4) {
    return null;
  }

  return (
    <Fab
      sx={{
        position: "fixed",
        bottom: 30,
        right: 30,
        background: "#b65c20",

        "&:hover": {
          background: "#cc6c2c",
        },
      }}
      onClick={() => {
        if (selected === "products") {
          setOpenCreateProduct(true);
        } else {
          setOpenCreateDish(true);
        }
      }}
    >
      <AddIcon />
    </Fab>
  );
}