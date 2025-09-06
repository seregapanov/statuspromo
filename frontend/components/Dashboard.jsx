// components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard';
import ShareModal from './ShareModal';
import CreateCampaign from './CreateCampaign';
import { createClient } from '@supabase/supabase-js';

// 🔧 Замените на свои данные из Supabase
const supabaseUrl = 'https://hezxfkeflzupndlbkshi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlenhma2VmbHp1cG5kbGJrc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzU5MDEsImV4cCI6MjA3MjY1MTkwMX0.qJYyJinI27Zx4bvYBv9d70cs-J3QPrFcwBLNAxz91eg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard({ user, setUser }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔁 Загрузка кампаний из базы
  const loadCampaigns = async () => {
    setLoading(true);
    console.log('🔄 [Dashboard] Запрос к Supabase: загрузка кампаний...');

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [Supabase] Ошибка загрузки кампаний:', error);
        alert('Не удалось загрузить кампании: ' + error.message);
      } else {
        console.log('✅ [Supabase] Получено кампаний:', data?.length || 0);
        console.log('📄 Данные:', data);

        // Фильтр: только валидные кампании
        const validCampaigns = Array.isArray(data)
          ? data.filter(camp => camp && typeof camp === 'object' && camp.id)
          : [];

        console.log('✅ Валидных кампаний после фильтрации:', validCampaigns.length);
        setCampaigns(validCampaigns);
      }
    } catch (err) {
      console.error('🔥 [Dashboard] Критическая ошибка:', err);
      alert('Произошла ошибка при загрузке кампаний');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем при монтировании
  useEffect(() => {
    loadCampaigns();
  }, []);

  // Обновляем список после создания новой кампании
  const handleCreateCampaign = (newCamp) => {
    console.log('🆕 Новая кампания добавлена:', newCamp);
    setCampaigns(prev => [newCamp, ...prev]); // Добавляем в начало
    setIsCreateModalOpen(false);
  };

  const handleShare = (campaign) => {
    console.log('📤 Поделиться:', campaign);
    setSelectedCampaign(campaign);
  };

  const handleCloseShareModal = () => {
    setSelectedCampaign(null);
  };

  const handleShared = () => {
    console.log('✅ Публикация подтверждена, баллы начислены');
    setUser((prev) => ({
      ...prev,
      points: (prev.points || 0) + selectedCampaign.points_reward,
    }));
    handleCloseShareModal();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Приветствие */}
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

        {/* Кнопка создания (только для бизнеса) */}
        {user.isBusiness && (
          <div className="mb-8">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium shadow-sm hover:shadow transition"
            >
              ➕ Создать кампанию
            </button>
          </div>
        )}

        {/* Загрузка */}
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Загружаем кампании...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm bg-white rounded-xl border border-gray-200">
            Нет активных кампаний
          </div>
        ) : (
          /* Лента кампаний */
          <div className="space-y-6">
            {campaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onShare={handleShare}
              />
            ))}
          </div>
        )}
      </div>

      {/* Модалки */}
      {isCreateModalOpen && (
        <CreateCampaign
          onClose={() => setIsCreateModalOpen(false)}
          onCampaignCreated={handleCreateCampaign}
        />
      )}

      {selectedCampaign && (
        <ShareModal
          campaign={selectedCampaign}
          user={user}
          onClose={handleCloseShareModal}
          onShared={handleShared}
        />
      )}
    </div>
  );
}
