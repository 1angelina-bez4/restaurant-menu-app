// server/chat.js
import OpenAI from 'openai';
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';Ц

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });Ц

const router = express.Router();

// Проверка ключа
const apiKey = process.env.VITE_OPENAI_API_KEY;
console.log('🔑 OpenAI Key:', apiKey ? '✅ Set' : '❌ Missing');

const openai = new OpenAI({
  apiKey: apiKey,
});

router.post('/api/chat', async (req, res) => {
  try {
    const { message, menu } = req.body;

    // Проверка наличия сообщения
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `
      Ты — AI-помощник ресторана "Вкусный уголок".
      Твоя задача — помогать пользователям с выбором блюд, отвечать на вопросы о составе, калориях и цене.

      Доступное меню:
      ${menu?.map(dish => `
        - ${dish.name}: ${dish.description || ''}. Цена: ${dish.price}₽.
      `).join('\n') || 'Меню пока не загружено'}

      Отвечай вежливо, кратко и по делу.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('❌ OpenAI Error:', error);
    res.status(500).json({ 
      error: 'OpenAI error',
      details: error.message 
    });
  }
});

export default router;