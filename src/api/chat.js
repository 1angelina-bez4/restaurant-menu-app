export async function getAIResponse(userMessage, menuData, userId) {
  try {
    const menuText = menuData.map(dish => {
      let text = `${dish.name}: ${dish.calories || 0} ккал, ${dish.price} ₽`;
      if (dish.description) {
        text += `. ${dish.description}`;
      }
      return text;
    }).join('\n');

    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        menuText: menuText,
        userId: userId,
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