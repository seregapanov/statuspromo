// Dashboard.jsx
import { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard';
import ShareModal from './ShareModal';

export default function Dashboard({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [userPoints, setUserPoints] = useState(user.points || 0);

  // Имитация загрузки кампаний
  useEffect(() => {
    // Здесь будет реальный запрос к Supabase
    const mockCampaigns = [
      {
        id: '1',
        title: 'Скидка 50% на кроссовки Nike',
        description: 'Ограниченное предложение — только сегодня!',
        video_url: '/demo/nike.mp4',
        points_reward: 15,
        target_link: 'https://nike.com/sale',
        utm_template: 'https://nike.com/sale?utm_source=telegram_status&utm_content={tg_login}',
        caption_template: 'Смотри, как круто! {link}',
      },
      {
        id: '2',
        title: 'Новый курс по AI от SkillUp',
        description: 'Научитесь генерировать контент за 7 дней',
        video_url: '/demo/ai-course.mp4',
        points_reward: 20,
        target_link: 'https://skillup.ai/course',
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
    setUserPoints((p) => p + selectedCampaign.points_reward);
    alert(`+${selectedCampaign.points_reward} баллов за публикацию!`);
    handleCloseModal();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Доступные кампании</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Ваши баллы:</span>
          <span className="font-semibold text-cyan-600">{userPoints} 🔹</span>
        </div>
      </div>

      {/* Лента кампаний */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} onShare={handleShare} />
        ))}
      </div>

      {/* Модальное окно шаринга */}
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
