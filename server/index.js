import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const YANDEX_API_KEY = process.env.VITE_YANDEX_API_KEY;
const YANDEX_FOLDER_ID = process.env.VITE_YANDEX_FOLDER_ID;

console.log('📋 Проверка ключей:', {
  Yandex: YANDEX_API_KEY ? '✅' : '❌',
  Supabase: process.env.VITE_SUPABASE_URL ? '✅' : '❌'
});

function findDish(menuText, query) {
  if (!menuText) return null;
  
  const lines = menuText.split('\n').filter(Boolean);
  const queryLower = query.toLowerCase().replace(/[.,!?]/g, '').trim();
  const queryWords = queryLower.split(' ').filter(w => w.length > 2);
  
  // Ищем по названиям
  const dishes = lines.map(line => {
    const match = line.match(/^(.+?):/);
    return match ? { name: match[1].trim(), line } : null;
  }).filter(Boolean);
  
  for (const dish of dishes) {
    const nameLower = dish.name.toLowerCase();
    
    // Точное совпадение
    if (nameLower === queryLower || nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
      return dish.line;
    }
    
    // По ключевым словам
    const matchCount = queryWords.filter(word => nameLower.includes(word)).length;
    if (matchCount >= queryWords.length * 0.5) {
      return dish.line;
    }
    
    // По частям слов
    if (queryWords.some(word => word.length > 3 && (nameLower.includes(word) || word.includes(nameLower)))) {
      return dish.line;
    }
  }
  
  return null;
}

function parseDish(line) {
  const match = line?.match(/^(.+?):\s*(\d+)\s*ккал,\s*(\d+)\s*₽/);
  return match ? { name: match[1].trim(), calories: +match[2], price: +match[3] } : null;
}

const cart = {
  getItems: async (userId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, quantity, dishes:dish_id(id, name, price, calories)')
      .eq('user_id', userId);
    return error ? [] : data || [];
  },
  
  add: async (userId, dishId) => {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('dish_id', dishId)
      .maybeSingle();
    
    if (existing) {
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select()
        .single();
      return error ? null : data;
    }
    
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ user_id: userId, dish_id: dishId, quantity: 1 })
      .select()
      .single();
    return error ? null : data;
  },
  
  clear: async (userId) => {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    return !error;
  },
  
  getSummary: async (userId) => {
    const items = await cart.getItems(userId);
    let total = 0;
    const result = items.map(item => {
      const dish = item.dishes;
      if (!dish) return null;
      const price = dish.price * item.quantity;
      total += price;
      return {
        dish_name: dish.name,
        price: dish.price,
        calories: dish.calories,
        quantity: item.quantity,
        total_price: price
      };
    }).filter(Boolean);
    return { items: result, total };
  }
};

async function createOrder(userId, address = '', phone = '', comment = '') {
  const cartItems = await cart.getItems(userId);
  if (!cartItems.length) return null;
  
  const totalPrice = cartItems.reduce((sum, item) => sum + item.dishes.price * item.quantity, 0);
  
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total_price: totalPrice,
      status: 'Ожидает подтверждения',
      address, phone, comment
    })
    .select()
    .single();
  
  if (error) return null;
  
  for (const item of cartItems) {
    await supabase
      .from('order_items')
      .insert({ order_id: order.id, dish_id: item.dish_id, quantity: item.quantity });
  }
  
  await cart.clear(userId);
  return { order, total: totalPrice };
}

const isCommand = (msg, keywords) => keywords.some(k => msg.toLowerCase().includes(k));
async function askYandexGPT(message, menuText, userId) {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    throw new Error('❌ Нет ключей YandexGPT!');
  }

  if (isCommand(message, ['мой заказ', 'показать заказ', 'корзина'])) {
    const { items, total } = await cart.getSummary(userId);
    if (!items.length) return '🛒 Ваша корзина пуста.';
    return `🛒 **Ваша корзина:**\n\n${items.map(i => `• ${i.dish_name} x${i.quantity} = ${i.total_price} ₽`).join('\n')}\n\n💰 **Итого: ${total} ₽**`;
  }


  if (isCommand(message, ['оформить заказ', 'сделать заказ', 'подтвердить заказ', 'оплатить'])) {
    const result = await createOrder(userId);
    if (!result) return '❌ Корзина пуста.';
    return `✅ Заказ #${String(result.order.id).slice(-6)} оформлен!\n💰 Итого: ${result.total} ₽\n\n⏱️ Время ожидания ~30 минут. Спасибо!`;
  }


  if (isCommand(message, ['добавь', 'закажи', 'хочу', 'в заказ'])) {
    const dishLine = findDish(menuText, message);
    if (!dishLine) return '❌ Блюдо не найдено. Пример: "добавь Паста Карбонара"';
    
    const dish = parseDish(dishLine);
    if (!dish) return '❌ Ошибка парсинга блюда';
    
    const { data: dishData } = await supabase
      .from('dishes')
      .select('id')
      .ilike('name', `%${dish.name}%`)
      .maybeSingle();
    
    if (!dishData) return `❌ Блюдо "${dish.name}" не найдено в БД`;
    
    await cart.add(userId, dishData.id);
    const { items, total } = await cart.getSummary(userId);
    return `✅ ${dish.name} добавлена в корзину! (${dish.calories} ккал, ${dish.price} ₽)\n\n🛒 **Корзина:**\n${items.map(i => `• ${i.dish_name} x${i.quantity} = ${i.total_price} ₽`).join('\n')}\n\n💰 **Итого: ${total} ₽**`;
  }

  const { data } = await axios.post(
    'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
    {
      modelUri: `gpt://${YANDEX_FOLDER_ID}/yandexgpt/latest`,
      completionOptions: { temperature: 0.3, maxTokens: 500 },
      messages: [
        { role: 'system', text: `Ты — ИИ-агент ресторана. Используй ТОЛЬКО данные из меню:\n${menuText}` },
        { role: 'user', text: message }
      ]
    },
    {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Api-Key ${YANDEX_API_KEY}` },
      timeout: 30000
    }
  );

  return data?.result?.alternatives?.[0]?.message?.text || 'Извините, не удалось получить ответ';
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, menuText, userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Необходимо авторизоваться' });
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    const reply = await askYandexGPT(message, menuText || 'Меню не загружено', userId);
    res.json({ reply });
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chat/test', (req, res) => {
  res.json({
    status: (YANDEX_API_KEY && YANDEX_FOLDER_ID) ? 'ready' : 'no-key'
  });
});

app.listen(PORT, () => console.log(`✅ AI-агент запущен на http://localhost:${PORT}`));