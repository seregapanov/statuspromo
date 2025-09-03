// components/AuthWidget.jsx

import React, { useEffect, useRef } from 'react';

export default function AuthWidget({ onAuth }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.error('❌ ref: контейнер не найден');
      return;
    }

    // Очищаем
    container.innerHTML = '';

    // Коллбэк авторизации
    window.onTelegramAuth = (user) => {
      console.log('✅ Авторизация успешна:', user);
      onAuth(user);
    };

    // Создаём скрипт
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'statuspromo_bot');
    script.setAttribute('data-size', 'large');
    
    // 🔧 Критически важно: используем разрешённый домен
    script.setAttribute('data-auth-url','https://organic-space-capybara-qv7wp7rvgpjfgr4-5173.app.github.dev/auth');
    
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    // Вставляем
    container.appendChild(script);

    // Очистка
    return () => {
      delete window.onTelegramAuth;
      if (script && script.parentNode) {
        script.remove();
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
