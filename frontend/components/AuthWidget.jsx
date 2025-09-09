// components/AuthWidget.jsx

import React, { useEffect, useRef } from 'react';

export default function AuthWidget({ onAuth }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Очистка
    container.innerHTML = '';

    // Убедимся, что функция доступна глобально
    const handleAuth = (user) => {
      console.log('✅ Авторизация успешна:', user);
      onAuth(user);
    };

    // Добавляем в window
    window.onTelegramAuth = handleAuth;

    // Проверка: доступна ли функция
    console.log('[AuthWidget] window.onTelegramAuth:', window.onTelegramAuth);

    // Создаём скрипт
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'statuspromo_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    // Логи
    script.onload = () => {
      console.log('✅ Telegram Widget: загружен');
    };
    script.onerror = () => {
      console.error('❌ Telegram Widget: не загрузился');
    };

    container.appendChild(script);

    // Очистка
    return () => {
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
    >
      {/* Telegram Widget появится здесь */}
    </div>
  );
}
