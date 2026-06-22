// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ← добавить
import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  IconButton,
} from '@mui/material';
import { PhotoCamera, Save } from '@mui/icons-material';
import { supabase } from '../supabaseClient';
import { uploadAvatar } from '../utils/uploadAvatar';

export default function ProfilePage() {
  const navigate = useNavigate(); // ← добавить

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    avatar_url: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Ошибка загрузки профиля:', error);
    } else if (data) {
      setProfile({
        full_name: data.full_name || '',
        phone: data.phone || '',
        avatar_url: data.avatar_url || '',
      });
    }

    setLoading(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      setUploading(false);
      return;
    }

    const result = await uploadAvatar(file, user.id);
    
    if (result.success) {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', user.id);

      if (error) {
        console.error('Ошибка обновления профиля:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка сохранения аватара',
          severity: 'error',
        });
      } else {
        setProfile({ ...profile, avatar_url: result.url });
        setSnackbar({
          open: true,
          message: 'Аватар успешно обновлён!',
          severity: 'success',
        });
      }
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Ошибка загрузки аватара',
        severity: 'error',
      });
    }

    setUploading(false);
    event.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        phone: profile.phone,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Ошибка сохранения:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка сохранения профиля',
        severity: 'error',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Профиль успешно обновлён!',
        severity: 'success',
      });
    }

    setSaving(false);
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
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, #2a211d 0%, #141010 100%)',
        p: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          background: 'linear-gradient(145deg, #1a0f0c 0%, #0d0806 100%)',
          borderRadius: 5,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Шапка с кнопкой "Назад" */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
            👤 Мой профиль
          </Typography>
        </Box>

        <Paper
          sx={{
            p: 4,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          {/* Аватар */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profile.avatar_url || ''}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: '#b65c20',
                  fontSize: 48,
                  border: '4px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 30px rgba(182,92,32,0.3)',
                }}
              >
                {profile.full_name?.charAt(0) || 'U'}
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
                    width: 36,
                    height: 36,
                    '&:disabled': { bgcolor: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  {uploading ? (
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                  ) : (
                    <PhotoCamera sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </label>
            </Box>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem',
                mt: 1,
              }}
            >
              Нажмите на камеру, чтобы загрузить фото
            </Typography>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

          <TextField
            fullWidth
            label="Ваше имя"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            sx={{
              mb: 3,
              '& label': {
                color: 'rgba(255,255,255,0.5)',
                '&.Mui-focused': { color: '#ff9d4d' },
              },
              '& input': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: '#ff9d4d' },
                '&.Mui-focused fieldset': { borderColor: '#ff9d4d' },
              },
            }}
          />

          <TextField
            fullWidth
            label="Номер телефона"
            placeholder="+7 (999) 123-45-67"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            sx={{
              mb: 4,
              '& label': {
                color: 'rgba(255,255,255,0.5)',
                '&.Mui-focused': { color: '#ff9d4d' },
              },
              '& input': { color: '#fff' },
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: '#ff9d4d' },
                '&.Mui-focused fieldset': { borderColor: '#ff9d4d' },
              },
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Save />}
            sx={{
              background: 'linear-gradient(135deg, #b65c20 0%, #8a4515 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #cc6c2c 0%, #a05220 100%)',
                boxShadow: '0 8px 25px rgba(182,92,32,0.4)',
              },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {saving ? 'Сохранение...' : '💾 Сохранить изменения'}
          </Button>
        </Paper>

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
      </Box>
    </Box>
  );
}