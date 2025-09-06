// App.jsx

import React, { useState, useEffect } from 'react';
import AuthWidget from './components/AuthWidget';
import Dashboard from './components/Dashboard';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hezxfkeflzupndlbkshi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlenhma2VmbHp1cG5kbGJrc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzU5MDEsImV4cCI6MjA3MjY1MTkwMX0.qJYyJinI27Zx4bvYBv9d70cs-J3QPrFcwBLNAxz91eg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [user, setUser] = useState(null);

  // При входе — загружаем пользователя
  useEffect(() => {
    const saved = localStorage.getItem('tgUser');
    if (saved) {
      const userData = JSON.parse(saved);
      setUser(userData);
      startPolling(userData); // 🔁 Запускаем опрос
    }
  }, []);

  // Функция опроса баллов
  const startPolling = (userData) => {
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('points')
        .eq('id', `tg_${userData.id}`)
        .single();

      if (!error && data && data.points !== userData.points) {
        console.log('✅ Баллы обновлены:', data.points);
        const updatedUser = { ...userData, points: data.points };
        localStorage.setItem('tgUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    }, 3000); // Проверка каждые 3 секунды

    // Очистка при выходе
    return () => clearInterval(interval);
  };

  const onAuth = (userData) => {
    const userWithRole = {
      ...userData,
      points: userData.points || 0,
      isBusiness: true,
    };

    // Сохраняем в базу
    supabase.from('users').upsert({
      id: `tg_${userData.id}`,
      telegram_id: userData.id,
      username: userData.username,
      first_name: userData.first_name,
      points: userWithRole.points,
    }, { onConflict: 'id' });

    localStorage.setItem('tgUser', JSON.stringify(userWithRole));
    setUser(userWithRole);
    startPolling(userWithRole); // Запускаем опрос
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">StatusPromo</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!user ? (
          <div className="text-center">
            <h2 className="text-xl text-gray-700 mb-6">Войдите через Telegram</h2>
            <AuthWidget onAuth={onAuth} />
          </div>
        ) : (
          <Dashboard user={user} setUser={setUser} />
        )}
      </main>
    </div>
  );
}
