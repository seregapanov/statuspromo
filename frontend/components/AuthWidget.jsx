// components/AuthSuccess.jsx

import React, { useEffect } from 'react';

export default function AuthSuccess({ onAuth }) {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = {
      id: urlParams.get('tg_id'),
      first_name: urlParams.get('first_name'),
      last_name: urlParams.get('last_name'),
      username: urlParams.get('username'),
      photo_url: `https://t.me/i/userpic/320/${urlParams.get('username') || 'unknown'}.jpg`,
    };

    // Сохраняем в localStorage
    localStorage.setItem('tgUser', JSON.stringify(userData));

    // Вызываем onAuth из App
    onAuth(userData);

    // Очищаем URL, чтобы не было данных
    window.history.replaceState({}, document.title, "/");
  }, [onAuth]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg text-gray-700">Входим в аккаунт...</p>
      <p className="text-sm text-gray-500 mt-2">Не закрывайте окно</p>
    </div>
  );
}
