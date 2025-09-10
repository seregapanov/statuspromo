// components/AuthWidget.jsx

import React, { useEffect, useRef } from 'react';

export default function AuthWidget({ onAuth }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    // Обработчик авторизации
    const handleAuth = (user) => {
      console.log('✅ Авторизация успешна:', user);
      onAuth(user);
    };

    // Добавляем в window (для совместимости)
    window.onTelegramAuth = handleAuth;

    // Слушаем postMessage от Telegram
    const handleMessage = (event) => {
      // Проверяем источник
      if (event.origin !== 'https://oauth.telegram.org') return;

      const { data } = event;
      if (typeof data === 'object' && data?.id) {
        handleAuth(data);
      } else if (typeof data === 'string') {
        try {
          const user = JSON.parse(data);
          if (user.id) handleAuth(user);
        } catch (e) {
          // Не JSON
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Создаём виджет
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

    // Очистка
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
    />
  );
}