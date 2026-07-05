'use client';
import Link from 'next/link';
import { useAuth } from '../app/context/AuthContext';
import { useTheme } from '../app/context/ThemeContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    const fetchOnline = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/online`);
        const data = await res.json();
        setOnlineCount(data.count);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOnline();
    const interval = setInterval(fetchOnline, 10000); // Опрос раз в 10 секунд
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="border-b border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wider text-blue-600 dark:text-blue-400">
          WHITE ROOM PROGRESS
        </Link>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Онлайн: {onlineCount}</span>
          </div>

          <button onClick={toggleTheme} className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link href="/" className="text-slate-700 dark:text-slate-300 hover:text-blue-500">Курсы</Link>
          
          {user ? (
            <>
              {user.isAdmin && <Link href="/admin" className="text-red-500 font-medium">Админ-панель</Link>}
              <Link href="/profile" className="text-slate-700 dark:text-slate-300 hover:text-blue-500">Кабинет</Link>
              <button onClick={logout} className="px-3 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Выйти</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-700 dark:text-slate-300 hover:text-blue-500">Вход</Link>
              <Link href="/register" className="px-3 py-1.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Регистрация</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
