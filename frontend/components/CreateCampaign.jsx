// components/CreateCampaign.jsx

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🔧 Замените на свои данные из Supabase
const supabaseUrl = 'https://hezxfkeflzupndlbkshi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhlenhma2VmbHp1cG5kbGJrc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzU5MDEsImV4cCI6MjA3MjY1MTkwMX0.qJYyJinI27Zx4bvYBv9d70cs-J3QPrFcwBLNAxz91eg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CreateCampaign({ onClose, onCampaignCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [targetLink, setTargetLink] = useState('');
  const [points, setPoints] = useState('10');
  const [caption, setCaption] = useState('{link}');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      alert('Выберите изображение или видео');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум — 15 МБ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(selectedFile);

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !targetLink || !file) {
      alert('Заполните все поля и выберите файл');
      return;
    }
    // Внутри handleSubmit:
    const uploadFile = async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('📁 Файл:', file);
      console.log('📦 Имя файла:', file.name);
      console.log('⚖️ Размер:', file.size);
      console.log('🎥 Тип:', file.type);

      const { error: uploadError } = await supabase.storage
        .from('campaign-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Получаем публичную ссылку
      const { data } = supabase.storage.from('campaign-media').getPublicUrl(filePath);
      return data.publicUrl;
    };

    let mediaUrl;
    try {
      mediaUrl = await uploadFile(file);
    } catch (err) {
      alert('Ошибка загрузки файла');
      return;
    }

    const id = `camp_${Date.now()}`;

    const newCampaign = {
      id,
      title,
      description,
      ...(file.type.startsWith('video/') ? { video_url: mediaUrl } : { image_url: mediaUrl }),
      target_link: targetLink,
      utm_template: `${targetLink}?utm_source=telegram_status&utm_content={tg_login}`,
      caption_template: caption,
      points_reward: parseInt(points) || 10,
    };

    

    // ✅ Сохраняем в Supabase
    const { data, error } = await supabase
      .from('campaigns')
      .insert([newCampaign]);

    if (error) {
      console.error('Ошибка сохранения:', error);
      alert('Не удалось сохранить кампанию');
      return;
    }
    

    // Уведомляем дашборд
    onCampaignCreated(newCampaign);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        overflow: 'auto',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
            🚀 Создать кампанию
          </h3>
          <button
            onClick={onClose}
            style={{
              fontSize: '1.5rem',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
              Название
            </label>
            <input
              placeholder="Например: Скидка 50% на кроссовки"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
              Описание
            </label>
            <textarea
              placeholder="Краткое описание кампании"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
              rows="2"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
              Видео или изображение
            </label>
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" id="media-upload" />
            <label
              htmlFor="media-upload"
              style={{
                display: 'block',
                border: '2px dashed #d1d5db',
                borderRadius: '0.5rem',
                padding: '1rem',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              {filePreview ? (
                <div style={{
                  height: '192px',
                  width: 'auto',
                  minWidth: '120px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {file.type.startsWith('video/') ? (
                    <video src={filePreview} style={{ height: '100%', maxWidth: 'none', objectFit: 'contain' }} />
                  ) : (
                    <img src={filePreview} alt="Превью" style={{ height: '100%', maxWidth: 'none', objectFit: 'contain' }} />
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9ca3af' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>Нажмите, чтобы загрузить</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>JPG, PNG, MP4, до 15 МБ</span>
                </div>
              )}
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
              Целевая ссылка
            </label>
            <input
              placeholder="https://ваш-сайт.com"
              value={targetLink}
              onChange={(e) => setTargetLink(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
              Баллы за публикацию
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
              }}
              min="1"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#4b5563', marginBottom: '0.5rem' }}>
              Подпись (используйте {'{link}'})
            </label>
            <textarea
              placeholder="Смотри, как круто! {link}"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.875rem',
                resize: 'vertical',
              }}
              rows="2"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                color: '#4b5563',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Создать кампанию
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
