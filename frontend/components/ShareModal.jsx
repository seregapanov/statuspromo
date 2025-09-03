// ShareModal.jsx
import { useState } from 'react';

export default function ShareModal({ campaign, user, onClose, onShared }) {
  const [caption, setCaption] = useState(
    campaign.caption_template.replace('{link}', '🔗 Присоединяйся!')
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Генерация UTM-ссылки
  const generateLink = () => {
    const tgLogin = user.username ? `@${user.username}` : `tg${user.telegram_id}`;
    const utm = campaign.utm_template.replace('{tg_login}', tgLogin);
    return utm;
  };

  const shortLink = `https://s.statuspromo.co/c/${Date.now()}`; // имитация короткой ссылки
  const fullCaption = caption.replace('{link}', shortLink);

  const handleDownload = async () => {
    setIsGenerating(true);

    // Имитация скачивания видео
    setTimeout(() => {
      setIsGenerating(false);
      onShared(); // начисляем баллы
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Поделиться в Telegram</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Превью */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подпись к статусу
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows="3"
            />
          </div>

          {/* Превью в стиле Telegram */}
          <div className="bg-gray-100 rounded-xl p-4 text-sm">
            <div className="text-gray-800 font-medium mb-1">Как будет выглядеть:</div>
            <div className="text-gray-700 whitespace-pre-wrap">{fullCaption}</div>
            <div className="text-cyan-600 underline text-xs mt-1">🔗 Присоединяйся!</div>
          </div>

          {/* Кнопка */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-progress transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Генерация...
              </>
            ) : (
              'Скачать и поделиться'
            )}
          </button>

          {/* Инструкция */}
          <div className="text-xs text-gray-500">
            <strong>Как опубликовать:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Скачайте видео</li>
              <li>Откройте Telegram</li>
              <li>Прикрепите видео → "Статус"</li>
              <li>Вставьте подпись и опубликуйте</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
