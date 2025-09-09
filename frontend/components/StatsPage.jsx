// components/StatsPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import supabase from '../supabaseClient';

// Компонент числа с подсветкой при изменении
function AnimatedStat({ value, id, label }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsChanging(true);
      const timeout = setTimeout(() => setIsChanging(false), 300);
      setDisplayValue(value);
      return () => clearTimeout(timeout);
    }
  }, [value, displayValue]);

  return (
    <span
      key={`${id}-${label}`}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors duration-300
        ${isChanging ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}
      `}
    >
      {displayValue}
    </span>
  );
}

export default function StatsPage({ user }) {
  const [campaignStats, setCampaignStats] = useState(new Map()); // Используем Map для быстрого доступа
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      // Загружаем кампании
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, title, points_reward, created_at');

      if (!campaigns || campaigns.length === 0) {
        setCampaignStats(new Map());
        return;
      }

      // Загружаем публикации
      const { data: shares } = await supabase
        .from('shares')
        .select('campaign_id');

      // Агрегируем
      const newStats = new Map(campaignStats); // Копируем старые данные
      let hasChanges = false;

      campaigns.forEach(camp => {
        const shareCount = shares.filter(s => s.campaign_id === camp.id).length;
        const old = campaignStats.get(camp.id);

        const updated = {
          ...camp,
          shares: shareCount,
          clicks: 0,
          ctr: '0.0',
        };

        if (!old || old.shares !== shareCount) {
          hasChanges = true;
        }

        newStats.set(camp.id, updated);
      });

      // Удаляем удалённые кампании
      for (let key of newStats.keys()) {
        if (!campaigns.find(c => c.id === key)) {
          newStats.delete(key);
          hasChanges = true;
        }
      }

      // Обновляем ТОЛЬКО при изменениях
      if (hasChanges) {
        setCampaignStats(newStats);
      }
    } catch (err) {
      console.error('Ошибка загрузки статистики:', err);
    }
  };

  // Первый раз — с спиннером
  useEffect(() => {
    loadStats();

    const interval = setInterval(() => {
      loadStats(); // Фоновое обновление
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Убираем спиннер после первой загрузки
  useEffect(() => {
    if (campaignStats.size > 0) {
      setLoading(false);
    }
  }, [campaignStats]);

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Загружаем статистику...</p>
      </div>
    );
  }

  if (campaignStats.size === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Нет активных кампаний</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📊 Статистика кампаний</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-800">Название</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800">Публикации</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800">Переходы</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-800">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.from(campaignStats.values()).map((camp) => (
                <tr key={camp.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{camp.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(camp.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="text-center py-4 px-4">
                    <AnimatedStat id={camp.id} value={camp.shares} label="shares" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <AnimatedStat id={camp.id} value={camp.clicks} label="clicks" />
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="inline-flex items-center justify-center w-12 h-8 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      {camp.ctr}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p><strong>Публикации:</strong> Подтверждённые публикации в статусе</p>
        <p><strong>Переходы:</strong> Будут доступны после подключения UTM</p>
        <p><strong>CTR:</strong> Click-Through Rate</p>
      </div>
    </div>
  );
}
