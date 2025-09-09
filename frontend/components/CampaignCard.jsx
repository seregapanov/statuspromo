// components/CampaignCard.jsx

import React, { useState } from 'react';

export default function CampaignCard({ campaign, onShare }) {
  const [hasError, setHasError] = useState(false);

  // ✅ Проверка: если campaign нет — не рендерим
  if (!campaign) {
    return null;
  }

  // ✅ Извлекаем поля
  const { video_url, image_url, title, description, points_reward } = campaign;

  // ✅ Проверяем, есть ли видео и можно ли его показать
  const showVideo = !hasError && video_url;
  const showImage = image_url && (!video_url || hasError);

  return (
    <div
      style={{
        width: '240px',
        minWidth: '240px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Блок с медиа */}
      <div
        style={{
          height: '192px',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {showVideo ? (
          <video
            src={video_url}
            style={{
              height: '100%',
              maxWidth: 'none',
              objectFit: 'contain',
            }}
            muted
            loop
            playsInline
            onError={() => setHasError(true)}
          />
        ) : showImage ? (
          <img
            src={image_url}
            alt={title}
            style={{
              height: '100%',
              maxWidth: 'none',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', padding: '0.5rem' }}>
            Нет медиа
          </div>
        )}
      </div>

      {/* Текст и кнопка */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
            {title}
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            🔹 {points_reward || 0} баллов
          </span>
          <button
            onClick={() => onShare(campaign)}
            style={{
              fontSize: '0.875rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#1d4ed8')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#2563eb')}
          >
            Поделиться
          </button>
        </div>
      </div>
    </div>
  );
}
