import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const router = express.Router();

// ============================================
// 🔑 КОНФИГУРАЦИЯ GIGACHAT
// ============================================
const GIGACHAT_CLIENT_ID = process.env.VITE_GIGACHAT_CLIENT_ID;
const GIGACHAT_SECRET = process.env.VITE_GIGACHAT_SECRET;
const GIGACHAT_SCOPE = 'GIGACHAT_API_PERS'; // или 'GIGACHAT_API_CORP'

console.log('🔑 GigaChat Client ID:', GIGACHAT_CLIENT_ID ? '✅ Set' : '❌ Missing');

// Хранилище для токена (чтобы не запрашивать каждый раз)
let cachedToken = null;
let tokenExpiry = null;

// ============================================
// 🔐 Функция получения Access Token
// ============================================
async function getGigaChatToken() {
  // Если токен еще валиден (живет ~30 минут)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('♻️ Используем кешированный токен');
    return cachedToken;
  }

  try {
    console.log('🔄 Получаем новый токен GigaChat...');

    // Генерируем уникальный RqUID (требование Сбера)
    const rqUid = crypto.randomUUID();

    // Формируем Basic Auth
    const credentials = `${GIGACHAT_CLIENT_ID}:${GIGACHAT_SECRET}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const authUrl = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth';

    const response = await axios.post(
      authUrl,
      new URLSearchParams({
        scope: GIGACHAT_SCOPE,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'RqUID': rqUid,
          'Authorization': `Basic ${base64Credentials}`,
        },
        // Важно: отключаем проверку SSL (Сбер использует самоподписанные сертификаты)
        httpsAgent: new (await import('https')).Agent({
          rejectUnauthorized: false,
        }),
        timeout: 15000,
      }
    );

    const { access_token, expires_at } = response.data;

    // Сохраняем токен на 25 минут (паспортная жизнь ~30 минут)
    cachedToken = access_token;
    tokenExpiry = Date.now() + 25 * 60 * 1000;

    console.log('✅ Токен GigaChat получен!');
    return access_token;
  } catch (error) {
    console.error('❌ Ошибка получения токена GigaChat:', error.response?.data || error.message);
    throw new Error('Не удалось получить токен GigaChat');
  }
}

// ============================================
// 📦 Функция запроса к GigaChat API
// ============================================
async function askGigaChat(userMessage, menuData) {
  try {
    const token = await getGigaChatToken();

    // Формируем системный промпт (как у вас было)
    const systemPrompt = `
      Ты — AI-помощник ресторана "Вкусный уголок".
      Твоя задача — помогать пользователям с выбором блюд, отвечать на вопросы о составе, калориях и цене.

      Доступное меню:
      ${menuData?.map(dish => `
        - ${dish.name}: ${dish.description || ''}. Цена: ${dish.price}₽.
        ${dish.ingredients?.length > 0 ? `Состав: ${dish.ingredients.map(i => i.products?.name || '').filter(Boolean).join(', ')}` : ''}
      `).join('\n') || 'Меню пока не загружено'}

      Отвечай вежливо, кратко и по делу.
      Если пользователь спрашивает о составе или калориях, дай точную информацию из меню.
      Если блюда нет в меню — честно скажи об этом.
    `;

    const apiUrl = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions';

    const response = await axios.post(
      apiUrl,
      {
        model: 'GigaChat-Pro', // или 'GigaChat' для базовой версии
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
        // Дополнительные параметры для GigaChat
        repetition_penalty: 1.07,
        update_interval: 0,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        httpsAgent: new (await import('https')).Agent({
          rejectUnauthorized: false,
        }),
        timeout: 30000,
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error('Пустой ответ от GigaChat');
    }

    return reply;
  } catch (error) {
    console.error('❌ Ошибка запроса к GigaChat:', error.response?.data || error.message);

    // Расшифровка частых ошибок
    if (error.response?.status === 401) {
      throw new Error('Ошибка авторизации GigaChat. Проверьте Client ID и Secret.');
    }
    if (error.response?.status === 429) {
      throw new Error('Превышен лимит запросов к GigaChat.');
    }
    if (error.response?.status === 402) {
      throw new Error('Закончился баланс GigaChat. Пополните счет.');
    }

    throw error;
  }
}

// ============================================
// 🚀 ЭНДПОИНТ /api/chat
// ============================================
router.post('/api/chat', async (req, res) => {
  try {
    const { message, menu } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`📩 Запрос: "${message.substring(0, 50)}..."`);

    const reply = await askGigaChat(message, menu);

    console.log(`💬 Ответ: "${reply.substring(0, 50)}..."`);
    res.json({ reply });
  } catch (error) {
    console.error('❌ GigaChat Error:', error.message);
    res.status(500).json({
      error: 'GigaChat error',
      details: error.message,
    });
  }
});

// ============================================
// 🧪 Тестовый эндпоинт для проверки токена
// ============================================
router.get('/api/chat/test', async (req, res) => {
  try {
    const token = await getGigaChatToken();
    res.json({ status: 'ok', message: 'GigaChat работает!', token: token.substring(0, 20) + '...' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;