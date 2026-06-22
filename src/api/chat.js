// src/api/chat.js
export async function getAIResponse(userMessage, menuData) {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        menu: menuData,
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