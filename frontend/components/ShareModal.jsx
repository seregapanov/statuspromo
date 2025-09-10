// components/ShareModal.jsx

import React, { useState } from 'react';

export default function ShareModal({ campaign, user, onClose, onShared }) {
  const [caption, setCaption] = useState(
    campaign.caption_template//.replace('{link}', '🔗 Присоединяйся!')
  );


  console.log(user.username)
  console.log(user.id)
  console.log(campaign.id)
  
  const tgLogin = user.username ? `@${user.username}` : `tg${user.id}`;
  const campaign_id = campaign.id;
  const baseLink = campaign.target_link || 'https://example1.com';
  const utmTemplate = campaign.utm_template || `${baseLink}?utm_source=statuspromo&utm_medium={tg_login}&utm_campaign={campaign_id}`;
  const utmLink = utmTemplate.replace('{tg_login}', tgLogin).replace('{campaign_id}', campaign_id);
  const fullCaption = caption.replace('{link}', utmLink);

  const botUrl = `https://t.me/statuspromo_bot?start=share_${campaign.id}`;

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
                width: '90%',
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
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
