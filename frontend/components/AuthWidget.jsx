import React from 'react';
import { useEffect } from 'react';
export default function AuthWidget({ onAuth }) {
  useEffect(() => {
    window.onTelegramAuth = (user) => {
      onAuth(user);
    };
  }, [onAuth]);

  return (
    <script
      async
      src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="statuspromo_bot"
      data-size="large"
      data-auth-url="https://statuspromo.vercel.app/auth"
      data-request-access="write"
      data-onauth="onTelegramAuth(user)"
    />
  );
}
