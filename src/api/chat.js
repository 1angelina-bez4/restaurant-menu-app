// src/api/chat.js
export async function getAIResponse(userMessage, menuData) {
  try {
    // ✅ ФОРМИРУЕМ ТЕКСТ МЕНЮ С КАЛОРИЯМИ
    const menuText = menuData.map(dish => 
      `${dish.name}: ${dish.calories || 0} ккал, ${dish.price} ₽. ${dish.description || ''}`
    ).join('\n');

    console.log('📋 Отправляем меню текстом:\n', menuText);

    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        menuText: menuText, // ← ПЕРЕДАЕМ ГОТОВЫЙ ТЕКСТ
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка сервера');
    }

    return data.reply;
  } catch (error) {
    console.error('❌ Ошибка запроса к AI:', error);
    return 'Извините, произошла ошибка. Попробуйте позже.';
  }
}