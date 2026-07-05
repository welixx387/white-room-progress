'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token]);

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Личный кабинет</h2>
      <div className="space-y-4 mb-6">
        <p><strong>Имя:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <div className="flex items-center space-x-2">
          <strong>Статус подписки:</strong>
          {user.isPremium ? (
            <span className="px-2.5 py-0.5 rounded bg-amber-500 text-white text-xs font-bold">PREMIUM ACTIVE</span>
          ) : (
            <span className="px-2.5 py-0.5 rounded bg-slate-400 text-white text-xs font-bold">Обычный аккаунт</span>
          )}
        </div>
      </div>
      <button onClick={logout} className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium">
        Выйти из системы
      </button>
    </div>
  );
}
