// CampaignCard.jsx
import { useNavigate } from 'react-router-dom';

export default function CampaignCard({ campaign, onShare }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Превью видео */}
      <div className="relative pb-[177.7%] bg-black rounded-t-xl overflow-hidden">
        <video
          src={campaign.video_url}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          preload="metadata"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
          {campaign.points_reward} 🔹
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          {campaign.title}
        </h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {campaign.description}
        </p>

        {/* Кнопка */}
        <button
          onClick={() => onShare(campaign)}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-lg hover:from-cyan-600 hover:to-blue-600 transition"
        >
          Поделиться в Telegram
        </button>
      </div>
    </div>
  );
}
