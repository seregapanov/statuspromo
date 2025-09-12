// components/AuthWidget.jsx

import React, { useEffect, useRef } from 'react';

// 🔒 Твои тестовые данные (никогда не коммить в продакшен!)
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

export default function AuthWidget({ onAuth, mock=true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // ✅ Проверяем: если в URL есть параметр ?mock=1 — используем заглушку
    const urlParams = new URLSearchParams(window.location.search);
    const useMock = urlParams.get('mock') === '1' && mock;

    if (useMock) {
      console.log('🔧 Используем заглушку пользователя:', MOCK_USER);
      // Имитируем задержку, как будто виджет загружается
      const timer = setTimeout(() => {
        onAuth(MOCK_USER);
      }, 800);
      return () => clearTimeout(timer);
    }

    // ⚙️ Реальный виджет (если не заглушка)
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const handleAuth = (user) => {
      console.log('✅ Авторизация успешна:', user);
      onAuth(user);
    };

    window.onTelegramAuth = handleAuth;

    const handleMessage = (event) => {
      if (event.origin !== 'https://oauth.telegram.org') return;

      const { data } = event;
      if (typeof data === 'object' && data?.id) {
        handleAuth(data);
      } else if (typeof data === 'string') {
        try {
          const user = JSON.parse(data);
          if (user.id) handleAuth(user);
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'statuspromo_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    script.onload = () => console.log('✅ Widget загружен');
    script.onerror = () => console.error('❌ Widget: не загрузился');

    container.appendChild(script);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (window.onTelegramAuth === handleAuth) {
        delete window.onTelegramAuth;
      }
      if (container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, [onAuth]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '1.5rem 0',
      }}
      onClick={() => {
          const url = new URL(window.location);
          url.searchParams.set('mock', '1');
          window.location.href = url.toString(); // Перезагружаем с ?mock=1
        }}
    />
  );
}
