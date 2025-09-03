// components/AuthWidget.jsx

import { useEffect } from 'react';

export default function AuthWidget({ onAuth }) {
  useEffect(() => {
    window.onTelegramAuth = (user) => {
      onAuth(user);
    };

    // Проверим, не загружен ли уже виджет
    if (window.TelegramLoginScriptInjected) return;
    window.TelegramLoginScriptInjected = true;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'statuspromo_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', 'https://statuspromo.vercel.app/auth');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    document.body.appendChild(script);

    return () => {
      // Очистка
      delete window.onTelegramAuth;
      if (script) script.remove();
    };
  }, [onAuth]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1rem',
      }}
    >
      {/* Telegram Widget добавится в body */}
    </div>
  );
}

