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

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// ============================================
// 🔑 SUPABASE
// ============================================
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// 🔑 YANDEXGPT
// ============================================
const YANDEX_API_KEY = process.env.VITE_YANDEX_API_KEY;
const YANDEX_FOLDER_ID = process.env.VITE_YANDEX_FOLDER_ID;

console.log('📋 ========== ПРОВЕРКА КЛЮЧЕЙ ==========');
console.log('🔑 Yandex API Key:', YANDEX_API_KEY ? '✅ Set' : '❌ Missing');
console.log('🔑 Yandex Folder ID:', YANDEX_FOLDER_ID ? '✅ Set' : '❌ Missing');
console.log('🔑 Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('📋 =====================================\n');

// ============================================
// 📏 Levenshtein Distance
// ============================================
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i-1] === a[j-1]) {
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i-1][j-1] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// ============================================
// 🔍 ПОИСК БЛЮДА В МЕНЮ
// ============================================
function findDishInMenu(menuText, query) {
  if (!menuText) return null;
  
  const lines = menuText.split('\n').filter(line => line.trim());
  const queryLower = query.toLowerCase();
  
  const dishEntries = lines.map(line => {
    const match = line.match(/^(.+?):/);
    return match ? { name: match[1].trim(), line: line } : null;
  }).filter(Boolean);
  
  const cleanText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .replace(/у$/g, '')
      .replace(/ю$/g, '')
      .replace(/ой$/g, '')
      .replace(/ую$/g, '')
      .trim();
  };
  
  const queryClean = cleanText(queryLower);
  const queryWords = queryClean.split(' ').filter(w => w.length > 2);
  
  for (const entry of dishEntries) {
    const nameClean = cleanText(entry.name);
    if (nameClean === queryClean || nameClean.includes(queryClean) || queryClean.includes(nameClean)) {
      return entry.line;
    }
  }
  
  for (const entry of dishEntries) {
    const nameLower = entry.name.toLowerCase();
    let matchCount = 0;
    for (const word of queryWords) {
      if (nameLower.includes(word)) {
        matchCount++;
      }
    }
    if (matchCount >= queryWords.length * 0.5) {
      return entry.line;
    }
  }
  
  for (const entry of dishEntries) {
    const nameLower = entry.name.toLowerCase();
    for (const word of queryWords) {
      if (word.length > 3) {
        if (nameLower.includes(word) || word.includes(nameLower)) {
          return entry.line;
        }
      }
    }
  }
  
  for (const entry of dishEntries) {
    const nameClean = cleanText(entry.name);
    const queryClean2 = queryLower.replace(/добавь|закажи|пасту|карбонару/gi, '').trim();
    const distance = getLevenshteinDistance(nameClean, queryClean2);
    const maxLen = Math.max(nameClean.length, queryClean2.length);
    const similarity = 1 - (distance / maxLen);
    
    if (similarity > 0.65) {
      return entry.line;
    }
  }
  
  return null;
}

// ============================================
// 🔧 ПАРСИНГ БЛЮДА ИЗ СТРОКИ
// ============================================
function parseDishFromLine(line) {
  if (!line) return null;
  const match = line.match(/^(.+?):\s*(\d+)\s*ккал,\s*(\d+)\s*₽/);
  if (match) {
    return {
      name: match[1].trim(),
      calories: parseInt(match[2]),
      price: parseInt(match[3])
    };
  }
  return null;
}

// ============================================
// 💾 РАБОТА С КОРЗИНОЙ (cart_items)
// ============================================
async function getCartItems(userId) {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        quantity,
        dish_id,
        dishes:dish_id (
          id,
          name,
          price,
          calories
        )
      `)
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ Ошибка загрузки корзины:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Ошибка в getCartItems:', error);
    return [];
  }
}

async function addToCart(userId, dishId) {
  try {
    // Проверяем, есть ли уже блюдо в корзине
    const { data: existing, error: findError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('dish_id', dishId)
      .maybeSingle();
    
    if (findError) {
      console.error('❌ Ошибка поиска в корзине:', findError);
    }
    
    if (existing) {
      // Обновляем количество
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Ошибка обновления корзины:', error);
        return null;
      }
      return data;
    } else {
      // Добавляем новую позицию
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          dish_id: dishId,
          quantity: 1
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Ошибка добавления в корзину:', error);
        return null;
      }
      return data;
    }
  } catch (error) {
    console.error('❌ Ошибка в addToCart:', error);
    return null;
  }
}

async function clearCart(userId) {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('❌ Ошибка очистки корзины:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Ошибка в clearCart:', error);
    return false;
  }
}

async function createOrderFromCart(userId, address = '', phone = '', comment = '') {
  try {
    // Получаем позиции корзины с данными о блюдах
    const cartItems = await getCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      return null;
    }
    
    // Считаем общую сумму
    let totalPrice = 0;
    const orderItemsData = cartItems.map(item => {
      const dish = item.dishes;
      const quantity = item.quantity;
      const price = dish.price * quantity;
      totalPrice += price;
      return {
        dish_id: dish.id,
        quantity: quantity
      };
    });
    
    // Создаем заказ
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total_price: totalPrice,
        status: 'Ожидает подтверждения',
        address: address || '',
        phone: phone || '',
        comment: comment || ''
      })
      .select()
      .single();
    
    if (orderError) {
      console.error('❌ Ошибка создания заказа:', orderError);
      return null;
    }
    
    // Добавляем позиции заказа (только dish_id и quantity)
    for (const item of orderItemsData) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          dish_id: item.dish_id,
          quantity: item.quantity
        });
      
      if (itemError) {
        console.error('❌ Ошибка добавления позиции:', itemError);
      }
    }
    
    // Очищаем корзину
    await clearCart(userId);
    
    return {
      order,
      items: orderItemsData,
      total: totalPrice
    };
  } catch (error) {
    console.error('❌ Ошибка в createOrderFromCart:', error);
    return null;
  }
}

async function getOrderSummary(userId) {
  try {
    const cartItems = await getCartItems(userId);
    if (!cartItems || cartItems.length === 0) {
      return { items: [], total: 0 };
    }
    
    let total = 0;
    const items = cartItems.map(item => {
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
    
    return { items, total };
  } catch (error) {
    console.error('❌ Ошибка в getOrderSummary:', error);
    return { items: [], total: 0 };
  }
}

// ============================================
// 🔧 ФУНКЦИИ ДЛЯ РАСПОЗНАВАНИЯ КОМАНД
// ============================================
function isAddToOrderCommand(message) {
  const keywords = [
    'добавь в заказ', 'добавить в заказ', 'в заказ',
    'добавь', 'добавить', 'закажи', 'заказать',
    'хочу заказать', 'положить в заказ', 'добав'
  ];
  return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

function isCheckoutCommand(message) {
  const keywords = ['оформить заказ', 'сделать заказ', 'подтвердить заказ', 'оплатить', 'заказать'];
  return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

function isShowOrderCommand(message) {
  const keywords = ['мой заказ', 'показать заказ', 'что в заказе', 'корзина'];
  return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

// ============================================
// 🤖 ИИ-АГЕНТ (YandexGPT)
// ============================================
async function askYandexGPT(userMessage, menuText, userId) {
  if (!YANDEX_API_KEY || !YANDEX_FOLDER_ID) {
    throw new Error('❌ Нет ключей YandexGPT!');
  }

  try {
    // ✅ ПОКАЗАТЬ ЗАКАЗ
    if (isShowOrderCommand(userMessage)) {
      const summary = await getOrderSummary(userId);
      if (!summary || summary.items.length === 0) {
        return '🛒 Ваша корзина пуста. Добавьте блюда через "добавь [название]"';
      }
      
      let text = '🛒 **Ваша корзина:**\n\n';
      summary.items.forEach(item => {
        text += `• ${item.dish_name} x${item.quantity} = ${item.total_price} ₽\n`;
      });
      text += `\n💰 **Итого: ${summary.total} ₽**`;
      return text;
    }
    
    // ✅ ОФОРМЛЕНИЕ ЗАКАЗА
    if (isCheckoutCommand(userMessage)) {
      const result = await createOrderFromCart(userId);
      if (!result) {
        return '❌ Ваша корзина пуста. Добавьте блюда через "добавь [название]"';
      }
      
      const orderId = String(result.order.id).slice(-6);
      let text = `✅ Заказ #${orderId} оформлен!\n\n`;
      // Получаем названия блюд для отображения
      const cartItems = await getCartItems(userId);
      cartItems.forEach(item => {
        const dish = item.dishes;
        if (dish) {
          text += `• ${dish.name} x${item.quantity} = ${dish.price * item.quantity} ₽\n`;
        }
      });
      text += `\n💰 **Итого: ${result.total} ₽**`;
      text += `\n\n⏱️ Время ожидания ~30 минут. Спасибо!`;
      return text;
    }
    
    // ✅ ДОБАВЛЕНИЕ В ЗАКАЗ
    if (isAddToOrderCommand(userMessage)) {
      console.log('🔍 Обнаружена команда "добавить в заказ"');
      
      const dishLine = findDishInMenu(menuText, userMessage);
      
      if (dishLine) {
        const dish = parseDishFromLine(dishLine);
        if (dish) {
          // Находим ID блюда в Supabase
          const { data: dishData, error: dishError } = await supabase
            .from('dishes')
            .select('id')
            .ilike('name', `%${dish.name}%`)
            .maybeSingle();
          
          if (dishError || !dishData) {
            console.error('❌ Ошибка поиска блюда в БД:', dishError);
            return `❌ Не удалось найти блюдо "${dish.name}" в базе данных.`;
          }
          
          await addToCart(userId, dishData.id);
          
          const summary = await getOrderSummary(userId);
          let text = `✅ ${dish.name} добавлена в корзину! (${dish.calories} ккал, ${dish.price} ₽)\n\n`;
          text += '🛒 **Ваша корзина:**\n';
          summary.items.forEach(item => {
            text += `• ${item.dish_name} x${item.quantity} = ${item.total_price} ₽\n`;
          });
          text += `\n💰 **Итого: ${summary.total} ₽**`;
          return text;
        }
      }
      
      return `❌ Блюдо не найдено. Попробуйте: "добавь Паста Карбонара"`;
    }

    // ✅ ОБЫЧНЫЙ ЗАПРОС К YANDEXGPT
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
`;

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

    return reply;
  } catch (error) {
    console.error('❌ Ошибка YandexGPT:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// 🚀 ЭНДПОИНТЫ
// ============================================
const TEST_USER_ID = '45e91f7d-5c87-4514-b926-c0d37...'; // ← ВСТАВЬТЕ ВАШ UUID!

app.post('/api/chat', async (req, res) => {
  try {
    const { message, menuText, userId } = req.body;

    // ✅ Проверяем, что userId передан
    if (!userId) {
      console.error('❌ userId не передан!');
      return res.status(400).json({ 
        error: 'Необходимо авторизоваться' 
      });
    }

    console.log('📩 Запрос от пользователя:', userId);
    console.log('📩 Сообщение:', message);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await askYandexGPT(message, menuText || 'Меню не загружено', userId);
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

app.listen(PORT, () => {
  console.log(`\n✅ ИИ-агент (YandexGPT) запущен на http://localhost:${PORT}`);
});