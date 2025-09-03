// components/CampaignCard.jsx

import React, { useState } from 'react';

export default function CampaignCard({ campaign, onShare }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Изображение слева */}
        <div className="md:w-48 md:h-48 flex-shrink-0 bg-gray-100 relative">
          {!hasError && campaign.video_url ? (
            <video
              src={campaign.video_url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              onError={() => setHasError(true)}
            />
          ) : campaign.image_url ? (
            <img
              src={campaign.image_url}
              alt={campaign.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
              Нет медиа
            </div>
          )}
        </div>

        {/* Текст и кнопка справа */}
        <div className="p-5 flex-1 flex flex-col">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              {campaign.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {campaign.description}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <span className="text-sm text-gray-500">
              🔹 {campaign.points_reward} баллов
            </span>
            <button
              onClick={() => onShare(campaign)}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Поделиться
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
