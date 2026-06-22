// src/pages/UsersPage.jsx
import { useState, useEffect } from 'react';
import { ArrowBack } from '@mui/icons-material';
import EditUserProfileModal from '../components/EditUserProfileModal';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { Search, Refresh, Edit as EditIcon } from '@mui/icons-material'; // ← добавить EditIcon
import { supabase } from '../supabaseClient';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } else {
      // Приводим данные к нужному формату
      const formattedUsers = (data || []).map(user => ({
        ...user,
        role_id: user.role_id || 1,
      }));
      setUsers(formattedUsers);
    }
    setLoading(false);
  };

  // Обработчик редактирования пользователя
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleRoleChange = async (userId, newRoleId) => {
    setSaving((prev) => ({ ...prev, [userId]: true }));

    const { error } = await supabase
      .from('profiles')
      .update({ role_id: newRoleId })
      .eq('id', userId);

    if (error) {
      console.error('Ошибка обновления роли:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка обновления роли',
        severity: 'error',
      });
    } else {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role_id: newRoleId } : user
        )
      );
      setSnackbar({
        open: true,
        message: 'Роль успешно обновлена!',
        severity: 'success',
      });
    }

    setSaving((prev) => ({ ...prev, [userId]: false }));
  };

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phone?.includes(search)
  );

  const getRoleLabel = (roleId) => {
    switch (roleId) {
      case 1: return 'Пользователь';
      case 2: return 'Администратор';
      case 4: return 'Повар';
      default: return 'Пользователь';
    }
  };

  const getRoleColor = (roleId) => {
    switch (roleId) {
      case 2: return 'error';
      case 4: return 'warning';
      case 1: return 'primary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#b65c20' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #2a1f1a 0%, #1a0f0c 100%)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton
          onClick={() => navigate('/menu')}
          sx={{
            color: 'rgba(255,255,255,0.4)',
            '&:hover': { color: '#ff9d4d' },
            mr: 2,
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h4"
          sx={{
            color: '#fff',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ff9d4d, #b65c20)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          👥 Управление пользователями
        </Typography>
      </Box>

      <TextField
        fullWidth
        placeholder="Поиск по имени или телефону..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiInputBase-root': {
            color: '#fff',
            borderRadius: 3,
            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
            '&:hover fieldset': { borderColor: '#ff9d4d' },
          },
          '& .MuiInputBase-input': {
            color: '#fff',
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ background: 'rgba(255,255,255,0.04)' }}>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>Пользователь</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>Телефон</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>Роль</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>Действия</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.5)' }}>Дата регистрации</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', py: 4 }}>
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{
                    '&:hover': { background: 'rgba(255,255,255,0.03)' },
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.avatar_url || ''}
                        sx={{ width: 36, height: 36, bgcolor: '#b65c20' }}
                      >
                        {user.full_name?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography sx={{ color: '#fff' }}>
                        {user.full_name || 'Без имени'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    {user.phone || 'Не указан'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role_id)}
                      size="small"
                      color={getRoleColor(user.role_id)}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Кнопка редактирования профиля */}
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                        sx={{
                          color: 'rgba(255,255,255,0.4)',
                          '&:hover': { color: '#ff9d4d' },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <Select
                        value={user.role_id || 1}
                        onChange={(e) => {
                          const newRole = Number(e.target.value);
                          handleRoleChange(user.id, newRole);
                        }}
                        size="small"
                        disabled={saving[user.id]}
                        sx={{
                          minWidth: 150,
                          color: '#fff',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                            '&:hover fieldset': { borderColor: '#ff9d4d' },
                          },
                          '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' },
                        }}
                      >
                        <MenuItem value={1}>Пользователь</MenuItem>
                        <MenuItem value={2}>Администратор</MenuItem>
                        <MenuItem value={4}>Повар</MenuItem>
                      </Select>
                      {saving[user.id] && (
                        <CircularProgress size={20} sx={{ color: '#b65c20' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 3,
            background: snackbar.severity === 'success' ? '#2e7d32' : '#c62828',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/*  Модалка редактирования профиля */}
      <EditUserProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedUser}
        onSave={handleUserUpdated}
      />
    </Box>
  );
}