import React from 'react';
import { useState, useEffect } from 'react';
import AuthWidget from './components/AuthWidget';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('tgUser');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const onAuth = (userData) => {
    localStorage.setItem('tgUser', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">StatusPromo</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!user ? (
          <div className="text-center">
            <h2 className="text-xl text-gray-700 mb-6">Войдите через Telegram</h2>
            <AuthWidget onAuth={onAuth} />
          </div>
        ) : (
          <Dashboard user={user} />
        )}
      </main>
    </div>
  );
}
