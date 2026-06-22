// src/components/EditUserProfileModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Typography,
} from '@mui/material';
import { PhotoCamera, Close } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { uploadAvatar } from '../utils/uploadAvatar';

export default function EditUserProfileModal({
  open,
  onClose,
  user,
  onSave,
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadAvatar(file, user.id);

    if (result.success) {
      setForm({ ...form, avatar_url: result.url });
    } else {
      alert('Ошибка загрузки аватара');
    }
    setUploading(false);
    event.target.value = '';
  };

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: form.avatar_url,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Ошибка обновления:', error);
      alert('Ошибка сохранения');
    } else {
      onSave({
        ...user,
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: form.avatar_url,
      });
      onClose();
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            background: '#1a0f0c',
            color: '#fff',
            borderRadius: 3,
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="span" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
          ✏️ Редактировать профиль
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={form.avatar_url || ''}
              sx={{ width: 100, height: 100, bgcolor: '#b65c20', fontSize: 40 }}
            >
              {form.full_name?.charAt(0) || 'U'}
            </Avatar>
            <input
              accept="image/*"
              id="avatar-upload"
              type="file"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                disabled={uploading}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: '#b65c20',
                  color: '#fff',
                  '&:hover': { bgcolor: '#cc6c2c' },
                  width: 32,
                  height: 32,
                }}
              >
                {uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : <PhotoCamera sx={{ fontSize: 16 }} />}
              </IconButton>
            </label>
          </Box>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', mt: 1 }}>
            {user.full_name || 'Без имени'}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="Имя"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          sx={{
            mb: 2,
            '& label': { color: 'rgba(255,255,255,0.5)' },
            '& input': { color: '#fff' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: '#ff9d4d' },
            },
          }}
        />

        <TextField
          fullWidth
          label="Телефон"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          sx={{
            '& label': { color: 'rgba(255,255,255,0.5)' },
            '& input': { color: '#fff' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
              '&:hover fieldset': { borderColor: '#ff9d4d' },
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            background: '#b65c20',
            '&:hover': { background: '#cc6c2c' },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : '💾 Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}