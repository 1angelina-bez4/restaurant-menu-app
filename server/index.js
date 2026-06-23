import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ============================================
// 🔑 YANDEXGPT КЛЮЧИ
// ============================================
const YANDEX_API_KEY = process.env.VITE_YANDEX_API_KEY;
const YANDEX_FOLDER_ID = process.env.VITE_YANDEX_FOLDER_ID;

console.log('📋 ========== ПРОВЕРКА КЛЮЧЕЙ ==========');
console.log('🔑 Yandex API Key:', YANDEX_API_KEY ? '✅ Set' : '❌ Missing');
console.log('🔑 Yandex Folder ID:', YANDEX_FOLDER_ID ? '✅ Set' : '❌ Missing');

if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
  console.log('⚠️ Добавьте в .env.local:');
  console.log('  VITE_YANDEX_API_KEY=ваш_ключ');
  console.log('  VITE_YANDEX_FOLDER_ID=ваш_folder_id');
}
console.log('📋 =====================================\n');

// ============================================
// 🤖 ИИ-АГЕНТ (YandexGPT)
// ============================================
async function askYandexGPT(userMessage, menuText) {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    throw new Error('❌ Нет ключей YandexGPT!');
  }

  try {
    const systemPrompt = `
Ты — ИИ-агент-консультант ресторана "Вкусный уголок".

ДОСТУПНЫЕ ДАННЫЕ (МЕНЮ):
${menuText || 'Меню пока не загружено'}

ПРАВИЛА:
1. Отвечай ТОЛЬКО НА ОСНОВЕ ДАННЫХ ИЗ МЕНЮ
2. Если спрашивают о калориях — НАЗОВИ ТОЧНУЮ ЦИФРУ
3. Если спрашивают о цене — НАЗОВИ ТОЧНУЮ ЦИФРУ
4. Если блюда нет в меню — скажи честно
5. Отвечай кратко и по делу

ФОРМАТ ОТВЕТА:
"Название блюда содержит X ккал. Цена: Y ₽."
`;

    console.log('📤 Отправка запроса к YandexGPT...');

    const response = await axios.post(
      'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
      {
        modelUri: `gpt://${YANDEX_FOLDER_ID}/yandexgpt/latest`,
        completionOptions: {
          temperature: 0.3,
          maxTokens: 500,
        },
        messages: [
          { role: 'system', text: systemPrompt },
          { role: 'user', text: userMessage }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${YANDEX_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    const reply = response.data?.result?.alternatives?.[0]?.message?.text;
    if (!reply) {
      throw new Error('Пустой ответ от YandexGPT');
    }

    console.log('✅ Ответ YandexGPT получен!');
    return reply;
  } catch (error) {
    console.error('❌ Ошибка YandexGPT:');
    console.error('  Статус:', error.response?.status);
    console.error('  Данные:', error.response?.data);
    console.error('  Сообщение:', error.message);
    throw error;
  }
}

// ============================================
// 🚀 ЭНДПОИНТЫ
// ============================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, menuText } = req.body;

    console.log('📩 Запрос:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await askYandexGPT(message, menuText || 'Меню не загружено');
    res.json({ reply });
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
});

app.get('/api/chat/test', (req, res) => {
  res.json({
    status: (YANDEX_API_KEY && YANDEX_FOLDER_ID) ? 'ready' : 'no-key',
    message: (YANDEX_API_KEY && YANDEX_FOLDER_ID) ? 'YandexGPT готов!' : 'Нет ключей!'
  });
});

app.get('/api/chat/keys', (req, res) => {
  res.json({
    hasApiKey: !!YANDEX_API_KEY,
    hasFolderId: !!YANDEX_FOLDER_ID,
    mode: (YANDEX_API_KEY && YANDEX_FOLDER_ID) ? 'yandex' : 'none'
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ ИИ-агент (YandexGPT) запущен на http://localhost:${PORT}`);
});