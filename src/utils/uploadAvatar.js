// src/utils/uploadAvatar.js
import { supabase } from '../supabaseClient';

export async function uploadAvatar(file, userId) {
  console.log('📤 uploadAvatar вызван', { fileName: file?.name, userId });

  if (!file) {
    console.error('❌ Файл не выбран');
    return { success: false, error: 'Файл не выбран' };
  }

  if (file.size > 2 * 1024 * 1024) {
    console.error('❌ Файл больше 2MB');
    return { success: false, error: 'Файл больше 2MB' };
  }

  if (!file.type.startsWith('image/')) {
    console.error('❌ Не изображение');
    return { success: false, error: 'Только изображения' };
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  console.log('📤 Имя файла:', fileName);

  // Проверка авторизации
  const { data: { session } } = await supabase.auth.getSession();
  console.log('🔑 Session:', session?.access_token ? '✅ Есть токен' : '❌ Нет токена');

  try {
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('❌ Ошибка загрузки:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Загружено:', data);

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('✅ URL:', urlData.publicUrl);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    console.error('❌ Исключение:', err);
    return { success: false, error: err.message };
  }
}