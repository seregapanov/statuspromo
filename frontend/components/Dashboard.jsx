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
        <div className="text-center py-8 px-4">Загружаем кампании...</div>
      ) : campaigns.length === 0 && !user.isBusiness ? (
        <div className="text-center py-8 px-4 text-gray-500 bg-white rounded-xl border border-gray-200 mx-4">
          Нет активных кампаний
        </div>
      ) : (
        <div
          className="relative px-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            minHeight: '240px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Контейнер прокрутки */}
          <div
            ref={scrollContainerRef}
            className="flex flex-row gap-4 pb-2"
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              padding: '0.5rem 0 0.5rem 0.5rem',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch', // Плавность на iOS
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
              maxWidth: '100vw', // 🔒 Не больше ширины экрана
              boxSizing: 'border-box',
            }}
          >
            {/* Скрыть скроллбар */}
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Карточка "Создать" */}
            {user.isBusiness && (
              <div
                className="flex-shrink-0"
                style={{
                  width: '220px', // 🔽 Уменьшено для мобильных
                  minWidth: '220px',
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
                onClick={() => setIsCreateModalOpen(true)}
              >
                {/* Блок с плюсом */}
                <div
                  style={{
                    height: '170px', // 🔽 Уменьшено
                    backgroundColor: '#f0f9ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '2.5rem',
                      color: '#3b82f6',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '80%',
                      height: '80%',
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
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                      Создать кампанию
                    </h3>
                    <p
                      style={{
                        fontSize: '0.75rem', // 🔽 Мельче текст
                        color: '#4b5563',
                        marginBottom: '0.75rem',
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
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>🚀</span>
                    <button
                      type="button"
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.target.style.backgroundColor = '#15803d')}
                      onMouseLeave={(e) => (e.target.style.backgroundColor = '#16a34a')}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                      }}
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
                style={{
                  width: '220px',
                  minWidth: '220px',
                  flexShrink: 0,
                }}
              />
            ))}
          </div>
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
