// src/components/Sidebar.jsx
import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  RestaurantMenu,
  ShoppingCart,
  Inventory,
  Person,
  Logout,
} from "@mui/icons-material";
import { useState, useEffect } from "react";

export default function Sidebar({
  selected,
  onChange,
  roleId,
}) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
          
        setUserName(profile?.full_name || "Пользователь");
        setUserAvatar(profile?.avatar_url || "");
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const menuItems = [
    { key: "dishes", label: "Блюда", icon: <RestaurantMenu /> },
    { key: "orders", label: "Мои заказы", icon: <ShoppingCart />, roles: [1] },
    { key: "products", label: "Склад продуктов", icon: <Inventory />, roles: [2, 4] },
    { key: "users", label: "Пользователи", icon: <Person />, roles: [2] },
  ];

  return (
    <Box
      sx={{
        width: 280,
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1a0f0c 0%, #0d0806 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        p: 3,
        position: "sticky",
        top: 0,
      }}
    >
      {/* Логотип */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h5"
          sx={{
            color: "#fff",
            fontWeight: 700,
            letterSpacing: 1,
            background: "linear-gradient(135deg, #ff9d4d, #b65c20)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          🍽️ Restaurant
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255,255,255,0.3)",
            display: "block",
            mt: 0.5,
          }}
        >
          Вкусный уголок
        </Typography>
      </Box>

      {/* Информация о пользователе */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          p: 1.5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        <Avatar
          src={userAvatar || ""}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#b65c20",
            fontSize: 18,
          }}
        >
          {!userAvatar && userName.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
          <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>
            {userName}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem" }}>
            {roleId === 1 ? "Пользователь" : roleId === 2 ? "Администратор" : "Повар"}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

      {/* Меню */}
      <Stack spacing={1} sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          if (item.roles && !item.roles.includes(roleId)) return null;

          const isActive = selected === item.key;

          return (
            <Button
              key={item.key}
              onClick={() => {
                if (item.key === "users") {
                  navigate("/users");
                } else {
                  onChange(item.key);
                }
              }}
              startIcon={item.icon}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                py: 1.5,
                px: 2,
                borderRadius: 3,
                background: isActive
                  ? "linear-gradient(90deg, rgba(182,92,32,0.3) 0%, transparent 100%)"
                  : "transparent",
                borderLeft: isActive ? "3px solid #b65c20" : "3px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#fff",
                  background: "rgba(255,255,255,0.05)",
                },
                "& .MuiButton-startIcon": {
                  color: isActive ? "#ff9d4d" : "rgba(255,255,255,0.3)",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", my: 3 }} />

      {/* Профиль и Выход */}
      <Stack spacing={1}>
        <Button
          onClick={() => navigate("/profile")}
          startIcon={<Person />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.4)",
            py: 1.2,
            px: 2,
            borderRadius: 3,
            transition: "all 0.2s ease",
            "&:hover": {
              color: "#fff",
              background: "rgba(255,255,255,0.05)",
            },
            "& .MuiButton-startIcon": {
              color: "rgba(255,255,255,0.3)",
            },
          }}
        >
           Профиль
        </Button>

        <Button
          onClick={handleLogout}
          startIcon={<Logout />}
          sx={{
            justifyContent: "flex-start",
            textTransform: "none",
            fontSize: "0.9rem",
            color: "rgba(255,100,100,0.5)",
            py: 1.2,
            px: 2,
            borderRadius: 3,
            transition: "all 0.2s ease",
            "&:hover": {
              color: "#ff4444",
              background: "rgba(255,68,68,0.08)",
            },
            "& .MuiButton-startIcon": {
              color: "rgba(255,100,100,0.4)",
            },
          }}
        >
          Выйти
        </Button>
      </Stack>
    </Box>
  );
}