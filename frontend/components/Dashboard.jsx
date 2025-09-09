// components/Dashboard.jsx

import React, { useState, useEffect, useRef } from 'react';
import CampaignCard from './CampaignCard';
import ShareModal from './ShareModal';
import CreateCampaign from './CreateCampaign';
import supabase from '../supabaseClient';

export default function Dashboard({ user }) {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // Загрузка кампаний
  useEffect(() => {
    const loadCampaigns = async () => {
      const { data, error } = await supabase.from('campaigns').select('*');
      if (error) {
        console.error('❌ Ошибка загрузки:', error);
      } else {
        const valid = data.filter(camp => camp && camp.id);
        setCampaigns(valid);
      }
      setLoading(false);
    };
    loadCampaigns();
  }, []);

  const handleShare = (campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseShareModal = () => {
    setSelectedCampaign(null);
  };

  const handleShared = () => {
    handleCloseShareModal();
  };

  // --- Автоматическая карусель ---
  useEffect(() => {
    if (!scrollContainerRef.current || campaigns.length === 0) return;

    const container = scrollContainerRef.current;

    const autoScroll = setInterval(() => {
      if (isHovered) return; // Останавливаем при наведении

      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll) {
        container.scrollTo({ left: 0, behavior: 'smooth' }); // В начало
      } else {
        container.scrollBy({ left: 240, behavior: 'smooth' }); // Следующая карточка
      }
    }, 3000); // Каждые 3 секунды

    return () => clearInterval(autoScroll);
  }, [campaigns, isHovered]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -240, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 240, behavior: 'smooth' });
  };

    return (
    <div>
      {/* Лента кампаний */}
      {loading ? (
        <div className="text-center py-10">Загружаем кампании...</div>
      ) : campaigns.length === 0 && !user.isBusiness ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-200">
          Нет активных кампаний
        </div>
      ) : (
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            minHeight: '240px',   // ✅ Высота = высоте карточки + немного сверху/снизу
            display: 'flex',
            alignItems: 'center', // ✅ Центрируем стрелки по вертикали
            justifyContent: 'center',
          }}
        >
          {/* Кнопка "влево" */}
          {/* <button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background: 'linear-gradient(90deg, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 0))',
              cursor: 'pointer',
            }}
          >
            <div className="w-8 h-8 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white/90 transition">
              ←
            </div>
          </button> */}

          {/* Контейнер с прокруткой */}
          <div
            ref={scrollContainerRef}
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              padding: '1rem 0.5rem',  // ✅ Добавим вертикальный padding
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              // ❌ Убрали maxHeight
            }}
          >
            {/* Скрыть скроллбар */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Карточка "Создать" и остальные — как раньше */}
            {user.isBusiness && (
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
                  cursor: 'pointer',
                }}
              >
                {/* Блок с плюсом — 192px */}
                <div
                  style={{
                    height: '192px',
                    backgroundColor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      fontSize: '3rem',
                      color: '#3b82f6',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '85%',
                      height: '85%',
                      borderRadius: '0.5rem',
                      backgroundColor: '#eff6ff',
                      border: '2px dashed #93c5fd',
                      lineHeight: 1,
                    }}
                  >
                    +
                  </div>
                </div>

                {/* Текст и кнопка */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                      Создать кампанию
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
                      Запустите свою рекламную кампанию
                    </p>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>🚀 Новая</span>
                    <button
                      type="button"
                      style={{
                        fontSize: '0.875rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#15803d')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = '#16a34a')}
                    >
                      Создать
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Остальные кампании */}
            {campaigns.map((camp) => (
              <CampaignCard
                key={camp.id}
                campaign={camp}
                onShare={handleShare}
              />
            ))}
          </div>

          {/* Кнопка "вправо" */}
          {/* <button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background: 'linear-gradient(270deg, rgba(249, 250, 251, 0.8), rgba(249, 250, 251, 0))',
              cursor: 'pointer',
            }}
          >
            <div className="w-8 h-8 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white/90 transition">
              →
            </div>
          </button> */}
        </div>
      )}

      {/* Модалки */}
      {isCreateModalOpen && (
        <CreateCampaign
          onClose={() => setIsCreateModalOpen(false)}
          onCampaignCreated={(newCamp) => {
            setCampaigns((prev) => [newCamp, ...prev]);
            setIsCreateModalOpen(false);
          }}
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
