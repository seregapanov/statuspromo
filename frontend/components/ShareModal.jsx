// components/ShareModal.jsx

import React, { useState } from 'react';

export default function ShareModal({ campaign, user, onClose, onShared }) {
  const [caption, setCaption] = useState(
    campaign.caption_template.replace('{link}', '->!')
  );
  const [storyUrl, setStoryUrl] = useState(''); // ← новое поле
  const [isConfirming, setIsConfirming] = useState(false);

  const tgLogin = user.username ? `@${user.username}` : `tg${user.id}`;
  const campaign_id = campaign.id;
  const baseLink = campaign.target_link || 'https://example1.com';
  const utmTemplate = campaign.utm_template || `${baseLink}?utm_source=statuspromo&utm_medium={tg_login}&utm_campaign={campaign_id}`;
  const utmLink = utmTemplate.replace('{tg_login}', tgLogin).replace('{campaign_id}', campaign_id);
  const fullCaption = caption.replace('{link}', utmLink);

  const botUrl = `https://t.me/statuspromo_bot?start=share_${campaign.id}`;

  const handleConfirm = () => {
    if (!storyUrl.trim()) {
      alert('Пожалуйста, введите ссылку на статус');
      return;
    }

    // Проверка формата
    const storyMatch = storyUrl.match(/t\.me\/([^\/]+)\/s\/(\d+)/i);
    if (!storyMatch) {
      alert('Неверный формат ссылки. Пример: https://t.me/username/s/123');
      return;
    }

    const [, username, storyId] = storyMatch;

    // Проверка, совпадает ли username с пользователем
    const expectedUsername = user.username;
    if (expectedUsername && username.toLowerCase() !== expectedUsername.toLowerCase()) {
      if (!confirm(`Вы указали @${username}, но вы вошли как @${expectedUsername}. Уверены?`)) {
        return;
      }
    }

    setIsConfirming(true);

    // Имитация проверки (на деле — можно проверить HEAD-запросом)
    setTimeout(() => {
      onShared();
      setIsConfirming(false);
    }, 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        overflow: 'auto',
        padding: '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            Поделиться в Telegram
          </h3>
          <button
            onClick={onClose}
            style={{
              fontSize: '1.5rem',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        {/* Контент */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.5rem',
              }}
            >
              Подпись к статусу
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
              rows="3"
            />
          </div>

          <div
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              padding: '1rem',
              fontSize: '0.875rem',
            }}
          >
            <div style={{ fontWeight: '600', color: '#4b5563', marginBottom: '0.5rem' }}>
              Как будет выглядеть:
            </div>
            <div style={{ whiteSpace: 'pre-wrap', color: '#4b5563' }}>{fullCaption}</div>
          </div>

          {/* Поле ввода ссылки на статус */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4b5563',
                marginBottom: '0.5rem',
              }}
            >
              🔗 Ссылка на статус
            </label>
            <input
              type="text"
              placeholder="https://t.me/username/s/123"
              value={storyUrl}
              onChange={(e) => setStoryUrl(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Опубликуйте статус и вставьте сюда ссылку
            </p>
          </div>

          <a
            href={botUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'block',
              backgroundColor: 'linear-gradient(90deg, #2563eb, #0369a1)',
              background: 'linear-gradient(90deg, #2563eb, #0369a1)',
              color: 'white',
              textAlign: 'center',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            📲 Получить материалы в Telegram-боте
          </a>

          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            <strong>Как опубликовать:</strong>
            <ol style={{ listStyle: 'decimal', paddingLeft: '1rem', marginTop: '0.25rem', lineHeight: '1.5' }}>
              <li>Перейдите в бота</li>
              <li>Получите видео и ссылку</li>
              <li>Скопируйте и опубликуйте как статус</li>
              <li>Вставьте ссылку выше и нажмите "Подтвердить"</li>
            </ol>
          </div>
        </div>

        {/* Кнопка подтверждения */}
        <div style={{ padding: '1.25rem', borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            style={{
              width: '100%',
              backgroundColor: isConfirming ? '#6366f1' : '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              cursor: isConfirming ? 'wait' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {isConfirming ? '✅ Проверка...' : '✅ Подтвердить публикацию'}
          </button>
        </div>
      </div>
    </div>
  );
}
