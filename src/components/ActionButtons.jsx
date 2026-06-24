import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

export default function ActionButtons({ roleId, showChat, setShowChat, selected, setOpenCreateProduct, setOpenCreateDish }) {
  return (
    <>
      {/* Чат */}
      {(roleId === 1 || roleId === 2) && !showChat && (
        <Fab
          sx={{
            position: "fixed",
            bottom: 100,
            right: 30,
            background: "#b65c20",
            "&:hover": { background: "#cc6c2c" },
          }}
          onClick={() => setShowChat(true)}
        >
          💬
        </Fab>
      )}

      {(roleId === 2 || roleId === 4) && (
        <Fab
          sx={{
            position: "fixed",
            bottom: 30,
            right: 30,
            background: "#b65c20",
            "&:hover": { background: "#cc6c2c" },
          }}
          onClick={() => {
            if (selected === "products") {
              setOpenCreateProduct(true);
            } else if (selected === "dishes") {
              setOpenCreateDish(true);
            }
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </>
  );
}