import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

export default function ProductFab({
  onClick,
}) {
  return (
    <Fab
      color="primary"
      sx={{
        position: "fixed",
        bottom: 30,
        right: 30,
      }}
      onClick={onClick}
    >
      <AddIcon />
    </Fab>
  );
}