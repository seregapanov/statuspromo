/**
 * telegram-login.js
 * 
 * Универсальный скрипт для Telegram Login Widget
 * Поддерживает несколько кнопок, кастомные события и проверку аутентификации
 */

class TelegramLogin {
  /**
   * Инициализация виджета
   * @param {string} botName - Имя бота (например, "statusads_bot")
   * @param {string} authUrl - URL для отправки данных (например, "/auth")
   * @param {Function} callback - Опциональный callback при успешной авторизации
   */
  constructor(botName, authUrl, callback = null) {
    this.botName = botName;
    this.authUrl = authUrl;
    this.callback = callback;
    this.widgetScriptLoaded = false;

    // Автоинициализация
    this.init();
  }

  init() {
    // Проверяем, не загружен ли уже скрипт Telegram
    if (!this.widgetScriptLoaded && !window.TelegramLoginWidget) {
      this.loadTelegramScript();
    } else {
      this.renderWidget();
    }
  }

  loadTelegramScript() {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.onload = () => {
      this.widgetScriptLoaded = true;
      this.renderWidget();
    };
    script.onerror = () => {
      console.error('Не удалось загрузить Telegram Widget');
    };
    document.head.appendChild(script);
  }

  renderWidget() {
    // Очищаем предыдущие кнопки
    const containerId = 'telegram-login-btn';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      // Вставляем в первый элемент с классом .telegram-auth (или можно кастомизировать)
      const placeholder = document.querySelector('.telegram-auth') || document.body;
      placeholder.appendChild(container);
    } else {
      container.innerHTML = '';
    }

    // Создаём кнопку через Telegram Widget
    window.TelegramLoginWidget = (user) => {
      this.onAuth(user);
    };

    // Вставляем виджет
    const widget = document.createElement('script');
    widget.async = true;
    widget.setAttribute('data-telegram-login', this.botName);
    widget.setAttribute('data-size', 'large');
    widget.setAttribute('data-auth-url', this.authUrl);
    widget.setAttribute('data-request-access', 'write');
    widget.setAttribute('data-onauth', 'TelegramLoginWidget(user)');
    widget.src = 'https://telegram.org/js/telegram-widget.js?22';

    container.appendChild(widget);
  }

  onAuth(user) {
    console.log('Пользователь авторизован:', user);

    // Сохраняем в localStorage
    localStorage.setItem('tgUser', JSON.stringify({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      auth_date: user.auth_date,
      hash: user.hash
    }));

    // Отправляем на сервер (опционально)
    this.sendToServer(user);

    // Вызываем callback
    if (this.callback && typeof this.callback === 'function') {
      this.callback(user);
    }

    // Редирект или обновление UI
    window.dispatchEvent(new CustomEvent('telegramAuthSuccess', { detail: user }));
  }

  async sendToServer(user) {
    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        console.warn('Ошибка при отправке данных на сервер');
      }
    } catch (err) {
      console.error('Не удалось отправить данные на сервер:', err);
    }
  }

  /**
   * Проверка, авторизован ли пользователь
   * @returns {Object|null} Данные пользователя или null
   */
  static isAuthenticated() {
    const saved = localStorage.getItem('tgUser');
    return saved ? JSON.parse(saved) : null;
  }

  /**
   * Выход из аккаунта
   */
  static logout() {
    localStorage.removeItem('tgUser');
    window.dispatchEvent(new CustomEvent('telegramAuthLogout'));
  }
}

// Делаем доступным глобально
window.TelegramLogin = TelegramLogin;

// Экспорт для модульных систем (если используется bundler)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelegramLogin;
}
