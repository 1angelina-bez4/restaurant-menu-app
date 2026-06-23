import { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, Typography, Paper, CircularProgress, IconButton,
} from '@mui/material';
import { Send, Close } from '@mui/icons-material';
import { getAIResponse } from '../api/chat';
import { supabase } from '../supabaseClient';

export default function AIChat({ userId, agentId, onClose, onOrderUpdate }) { // ← добавили onOrderUpdate
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const endRef = useRef(null);

  // Загрузка меню с калориями
  useEffect(() => {
    async function loadMenu() {
      try {
        const { data, error } = await supabase
          .from('dishes')
          .select('id, name, description, price, calories, totalweight');

        if (error) {
          console.error('❌ Ошибка загрузки меню:', error);
          return;
        }

        if (data && data.length > 0) {
          const dishesWithIngredients = await Promise.all(
            data.map(async (dish) => {
              const { data: ingredients, error: ingError } = await supabase
                .from('dish_products')
                .select(`
                  amount,
                  products ( name, calories )
                `)
                .eq('dish_id', dish.id);

              if (ingError) {
                console.error('Ошибка загрузки ингредиентов:', ingError);
                return { ...dish, ingredients: [] };
              }

              return {
                ...dish,
                ingredients: ingredients || [],
              };
            })
          );

          console.log('📋 Меню с калориями:', dishesWithIngredients.map(d => ({
            name: d.name,
            calories: d.calories,
            totalweight: d.totalweight
          })));

          setMenuData(dishesWithIngredients);
        } else {
          setMenuData(data || []);
        }
      } catch (error) {
        console.error('❌ Ошибка:', error);
        setMenuData([]);
      }
    }
    loadMenu();
  }, []);

  // Загрузка истории
  useEffect(() => {
    async function loadHistory() {
      try {
        const { data, error } = await supabase
          .from('agent_chats')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Ошибка загрузки истории:', error);
          setMessages([]);
          return;
        }

        setMessages(data || []);
      } catch (error) {
        console.error('❌ Ошибка:', error);
        setMessages([]);
      }
    }

    if (userId && agentId) {
      loadHistory();
    }
  }, [userId, agentId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClose = () => {
    console.log('🔄 handleClose вызван!');
    setIsChatOpen(false);
    if (onClose) {
      console.log('📞 onClose существует, вызываем...');
      onClose();
    } else {
      console.log('⚠️ onClose не передан!');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user', message: userMessage }];
    setMessages(newMessages);


    try {
      await supabase.from('agent_chats').insert({
        user_id: userId,
        agent_id: agentId,
        message: userMessage,
        role: 'user',
      });
    } catch (error) {
      console.log('⚠️ Не удалось сохранить сообщение в БД:', error.message);
    }

    try {

      const reply = await getAIResponse(userMessage, menuData, userId);
      
      const updated = [...newMessages, { role: 'assistant', message: reply }];
      setMessages(updated);


      try {
        await supabase.from('agent_chats').insert({
          user_id: userId,
          agent_id: agentId,
          message: reply,
          role: 'assistant',
        });
      } catch (error) {
        console.log('⚠️ Не удалось сохранить ответ в БД:', error.message);
      }

      
      if (
        reply.includes('добавлена в корзину') || 
        reply.includes('корзину') || 
        reply.includes('Ваша корзина')
      ) {
        console.log('🔄 Обнаружено изменение корзины, обновляем...');
        if (onOrderUpdate) {
          onOrderUpdate();
        }
      }
    } catch (error) {
      console.error('❌ Ошибка получения ответа:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        message: 'Извините, произошла ошибка. Попробуйте позже.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isChatOpen) {
    return null;
  }

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 20, 
      right: 20, 
      width: 400, 
      height: 500,
      bgcolor: '#1a0f0c', 
      borderRadius: 3, 
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden', 
      zIndex: 1000 
    }}>
      
      <Box sx={{ 
        p: 2, 
        bgcolor: '#2a1814', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography sx={{ color: '#fff' }}>🤖 AI-помощник</Typography>
        <IconButton 
          sx={{ color: '#fff' }} 
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1 
      }}>
        {messages.length === 0 && !loading && (
          <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 4 }}>
            Спросите что-нибудь о меню 😊
          </Typography>
        )}
        {messages.map((msg, i) => (
          <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Paper sx={{ 
              p: 1.5, 
              maxWidth: '80%', 
              bgcolor: msg.role === 'user' ? '#b65c20' : 'rgba(255,255,255,0.05)', 
              color: '#fff' 
            }}>
              <Typography variant="body2">{msg.message}</Typography>
            </Paper>
          </Box>
        ))}
        <div ref={endRef} />
      </Box>

      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(255,255,255,0.08)', 
        display: 'flex', 
        gap: 1 
      }}>
        <TextField 
          fullWidth 
          size="small" 
          placeholder={loading ? "⏳ Думаю..." : "Спросите о блюдах..."}
          value={input}
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          disabled={loading}
          sx={{ 
            '& input': { color: '#fff' }, 
            '& .MuiOutlinedInput-root': { 
              '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } 
            } 
          }} 
        />
        <Button 
          variant="contained" 
          onClick={sendMessage} 
          disabled={loading || !input.trim()}
          sx={{ 
            bgcolor: '#b65c20', 
            '&:hover': { bgcolor: '#cc6c2c' }, 
            minWidth: 50,
            '&.Mui-disabled': {
              bgcolor: 'rgba(182, 92, 32, 0.5)',
            }
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : <Send />}
        </Button>
      </Box>
    </Box>
  );
}