// components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard';
import ShareModal from './ShareModal';

export default function Dashboard({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    const mockCampaigns = [
      {
        id: '1',
        title: 'Скидка 50% на кроссовки Nike',
        description: 'Ограниченное предложение — только сегодня! Успей купить по низкой цене.',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        points_reward: 15,
        utm_template: 'https://nike.com/sale?utm_source=telegram_status&utm_content={tg_login}',
        caption_template: 'Смотри, как круто! {link}',
      },
      {
        id: '2',
        title: 'Новый курс по AI от SkillUp',
        description: 'Научитесь генерировать контент за 7 дней с помощью нейросетей.',
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        points_reward: 20,
        utm_template: 'https://skillup.ai/course?utm_source=telegram_status&utm_content={tg_login}',
        caption_template: 'Прокачай скиллы! {link}',
      },
    ];
    setCampaigns(mockCampaigns);
  }, []);

  const handleShare = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
  };

  const handleShared = () => {
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Баллы — отдельно */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Добро пожаловать, {user.first_name || 'Пользователь'}!
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Поделитесь рекламой через статус и получите вознаграждение
            </p>
          </div>

          <div className="bg-white px-5 py-4 rounded-xl border border-gray-200 shadow-sm min-w-48 text-center">
            <p className="text-xs text-gray-500 mb-1">Ваш баланс</p>
            <p className="text-lg font-semibold text-gray-900">
              {user.points || 0} <span className="text-blue-600">баллов</span>
            </p>
            <div className="mt-2 w-8 h-0.5 bg-blue-100 mx-auto rounded"></div>
          </div>
        </div>

        {/* Кампании — одна под другой */}
        <div className="space-y-6">
          {campaigns.map((camp) => (
            <CampaignCard
              key={camp.id}
              campaign={camp}
              onShare={handleShare}
            />
          ))}

          {campaigns.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
              Нет активных кампаний
            </div>
          )}
        </div>
      </div>

      {selectedCampaign && (
        <ShareModal
          campaign={selectedCampaign}
          user={user}
          onClose={handleCloseModal}
          onShared={handleShared}
        />
      )}
    </div>
  );
}
