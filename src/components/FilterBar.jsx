import { Box, TextField, Typography, MenuItem, Select, InputAdornment, Button } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  filterPrice,
  setFilterPrice,
  filterCalories,
  setFilterCalories,
  clearFilters,
  totalCount,
}) {
  return (
    <>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "flex-end",
          justifyContent: "center",
          py: 1.5,
          px: 0,
        }}
      >
        {/* Поиск */}
        <Box sx={{ flex: 1, minWidth: 200, maxWidth: 400 }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.7rem",
              fontWeight: 600,
              mb: 0.5,
              ml: 1,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            🔍 Поиск
          </Typography>
          <TextField
            placeholder="Найти блюдо..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: "100%",
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                borderRadius: 2,
                height: 44,
                bgcolor: "rgba(255,255,255,0.03)",
                "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&.Mui-focused fieldset": { borderColor: "#b65c20" },
              },
              "& .MuiInputBase-input": { color: "#fff", py: 1 },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* Фильтр по цене */}
        <Box sx={{ minWidth: 140 }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.7rem",
              fontWeight: 600,
              mb: 0.5,
              ml: 1,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            💰 Цена
          </Typography>
          <Select
            value={filterPrice}
            onChange={(e) => setFilterPrice(e.target.value)}
            displayEmpty
            sx={{
              color: "#fff",
              borderRadius: 2,
              height: 44,
              minWidth: 140,
              bgcolor: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.08)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#b65c20" },
              "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
              "& .MuiSelect-select": { py: 1 },
            }}
          >
            <MenuItem value="all">Все цены</MenuItem>
            <MenuItem value="low">⬆️ Сначала дешевле</MenuItem>
            <MenuItem value="high">⬇️ Сначала дороже</MenuItem>
          </Select>
        </Box>

        {/* Фильтр по калориям */}
        <Box sx={{ minWidth: 140 }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "0.7rem",
              fontWeight: 600,
              mb: 0.5,
              ml: 1,
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            🔥 Калории
          </Typography>
          <Select
            value={filterCalories}
            onChange={(e) => setFilterCalories(e.target.value)}
            displayEmpty
            sx={{
              color: "#fff",
              borderRadius: 2,
              height: 44,
              minWidth: 140,
              bgcolor: "rgba(255,255,255,0.03)",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.08)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.2)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#b65c20" },
              "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.4)" },
              "& .MuiSelect-select": { py: 1 },
            }}
          >
            <MenuItem value="all">Все калории</MenuItem>
            <MenuItem value="low">⬆️ Сначала меньше</MenuItem>
            <MenuItem value="high">⬇️ Сначала больше</MenuItem>
          </Select>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          pb: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
          🍽️ Найдено: <strong style={{ color: "#ff9d4d", fontWeight: 700 }}>{totalCount}</strong> блюд
        </Typography>

        {(searchQuery || filterPrice !== "all" || filterCalories !== "all") && (
          <Button
            onClick={clearFilters}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "0.75rem",
              textTransform: "none",
              "&:hover": { color: "#fff" },
            }}
          >
            ✕ Сбросить
          </Button>
        )}
      </Box>
    </>
  );
}