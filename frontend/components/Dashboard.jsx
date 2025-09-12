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
      minHeight: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 1rem', // ← Добавим отступы по бокам
      margin: '0 -1rem', // ← Компенсируем, если нужно
      overflow: 'visible',
    }}
  >
    {/* Контейнер с прокруткой */}
    <div
      ref={scrollContainerRef}
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        padding: '1rem 0.5rem',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE/Edge
        WebkitOverflowScrolling: 'touch', // Плавность на iOS
        maxWidth: '100vw', // 🔒 Не выходит за экран
        width: '100%',
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
          style={{
            width: '240px',
            minWidth: '240px', // ✅ Фиксированная ширина, но не растягивается
            flexShrink: 0, // ⚠️ Не сжимается
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
              height: '192px',
              backgroundColor: '#f0f9ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
        />
      ))}
    </div>
  </div>
)}
