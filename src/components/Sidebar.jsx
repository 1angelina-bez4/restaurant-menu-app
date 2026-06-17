import {
  Box,
  Typography,
  Stack,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Sidebar({
  selected,
  onChange,
  roleId,
}) {

  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };
  return (
    <Box
      sx={{
        width: 260,
        borderRight: "1px solid rgba(255,255,255,0.1)",
        p: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: "#fff",
          fontWeight: 700,
          mb: 4,
        }}
      >
        Restaurant
      </Typography>

      <Stack spacing={2}>
        <Button
          variant={
            selected === "dishes"
              ? "contained"
              : "outlined"
          }
          onClick={() => onChange("dishes")}
        >
          🍽 Блюда
        </Button>

        {roleId === 2 && (
          <Button
            variant={
              selected === "products"
                ? "contained"
                : "outlined"
            }
            onClick={() => onChange("products")}
          >
            🥬 Продукты
          </Button>
        )}
      </Stack>
      <Button
        variant="outlined"
        color="error"
        onClick={handleLogout}
        sx={{
          mt: 4,
          borderColor: "rgba(255,255,255,0.2)",
        }}
      >
        🚪 Выйти
      </Button>
    </Box>
  );
}