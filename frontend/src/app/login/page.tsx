'use client';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка авторизации');
      login(data.token, data.user);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">Вход в аккаунт</h2>
      {error && <div className="p-3 mb-4 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 rounded border bg-transparent outline-none focus:border-blue-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Пароль</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2.5 rounded border bg-transparent outline-none focus:border-blue-500" required />
        </div>
        <button type="submit" className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">Войти</button>
      </form>
    </div>
  );
}
