// App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthWidget from './components/AuthWidget';
import Dashboard from './components/Dashboard';
import StatsPage from './components/StatsPage';
import supabase from './supabaseClient';

// 🔒 Тестовый пользователь
const MOCK_USER = {
  auth_date: 1757701330,
  first_name: "Сергей",
  hash: "03ce93026b5ca6d1a56386a13c21b70509e4937a8cb038f97f8bce9bab5bde53",
  id: 472661531,
  isBusiness: true,
  last_name: "Панов",
  points: 300,
  username: "panov_serge",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginScreen, setShowLoginScreen] = useState(false);

  // При старте: проверяем URL на ?mock=1
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const useMock = urlParams.get('mock') === '1';

    if (useMock) {
      const mockWithId = { ...MOCK_USER, id: `tg_${MOCK_USER.id}` };
      localStorage.setItem('tgUser', JSON.stringify(mockWithId));
      setUser(mockWithId);
      return;
    }

    const saved = localStorage.getItem('tgUser');
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        setUser(userData);
      } catch (err) {
        console.error('Ошибка парсинга:', err);
      }
    }
  }, []);

  const onAuth = async (userData) => {
    const userId = `tg_${userData.id}`;

    const { data: existingUser } = await supabase
      .from('users')
      .select('points, isBusiness')
      .eq('id', userId)
      .single();

    const fullUser = {
      ...userData,
      points: existingUser?.points || 0,
      isBusiness: existingUser?.isBusiness || false,
    };

    if (!existingUser) {
      await supabase.from('users').insert({
        id: userId,
        telegram_id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        photo_url: userData.photo_url,
        points: 0,
        isBusiness: false,
      });
    }

    localStorage.setItem('tgUser', JSON.stringify(fullUser));
    setUser(fullUser);
    setShowLoginScreen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowLoginScreen(true); // Явно показываем экран входа
    setMenuOpen(false);
  };

  // 🔁 Если пользователь не установлен — показываем экран входа
  if (!user && !showLoginScreen) {
    const savedUser = localStorage.getItem('tgUser');
    const lastUser = savedUser ? JSON.parse(savedUser) : null;

    // Если есть сохранённый — показываем кнопку "Войти снова"
    if (lastUser) {
      setShowLoginScreen(true);
    }
  }

  if (!user && showLoginScreen) {
    const savedUser = localStorage.getItem('tgUser');
    const lastUser = savedUser ? JSON.parse(savedUser) : null;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">StatusPromo</h1>

            {lastUser ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <img
                    src={
                      lastUser.photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        lastUser.first_name[0] + (lastUser.last_name ? lastUser.last_name[0] : '')
                      )}&background=2563EB&color=fff&size=64`
                    }
                    alt="Аватар"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{lastUser.first_name} {lastUser.last_name}</p>
                    <p className="text-sm text-gray-500">@{lastUser.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => setUser(lastUser)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  🔐 Войти
                </button>

                {/* <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Или войдите через Telegram:</p>
                  <AuthWidget onAuth={onAuth} />
                </div> */}
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6">Войдите через Telegram</p>
                <AuthWidget onAuth={onAuth} />
              </>
            )}
            
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          {user && (
            <header className="bg-white border-b border-gray-200 shadow-sm">
              <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Логотип и приветствие */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">StatusPromo</h1>
                    <p className="text-sm text-gray-600">
                      Привет, <span className="font-medium">{user.first_name}</span>!
                    </p>
                  </div>
                </div>

                {/* Профиль с меню */}
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 rounded-full transition"
                  >
                    <img
                      src={
                        user.photo_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.first_name[0] + (user.last_name ? user.last_name[0] : '')
                        )}&background=2563EB&color=fff&size=128`
                      }
                      alt="Аватар"
                      className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
                    />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <a href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <span>📊</span>
                        <span>Кампании</span>
                      </a>
                      <a href="/stats" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                        <span>📈</span>
                        <span>Статистика</span>
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 font-medium flex items-center space-x-2"
                      >
                        <span>🚪</span>
                        <span>Выйти</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {menuOpen && (
                <div
                  className="fixed inset-0 z-40 bg-black bg-opacity-20"
                  onClick={() => setMenuOpen(false)}
                ></div>
              )}
            </header>
          )}


          <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
            <Routes>
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/stats" element={<StatsPage user={user} />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
