'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Поля формы курса
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [materials, setMaterials] = useState<{ link: string; description: string }[]>([{ link: '', description: '' }]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (token && user?.isAdmin) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    const resUsers = await fetch('http://localhost:5000/api/users', { headers });
    const resCourses = await fetch('http://localhost:5000/api/courses', { headers });
    setUsers(await resUsers.json());
    setCourses(await resCourses.json());
  };

  const handleTogglePremium = async (id: string) => {
    await fetch(`http://localhost:5000/api/users/${id}/premium`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadData();
  };

  const handleDeleteCourse = async (id: string) => {
    await fetch(`http://localhost:5000/api/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    loadData();
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, coverImage, materials, isPremium })
    });
    setTitle(''); setCoverImage(''); setIsPremium(false); setMaterials([{ link: '', description: '' }]);
    loadData();
  };

  if (!user?.isAdmin) return <p className="text-red-500 text-center">Доступ закрыт.</p>;

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">Администрирование платформы</h1>

      {/* Форма создания */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold mb-4">Создать новый курс</h2>
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <input type="text" placeholder="Название курса" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded border bg-transparent" required />
          <input type="text" placeholder="Ссылка на обложку (URL)" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full p-2 rounded border bg-transparent" required />
          
          <div>
            <label className="block text-sm font-medium mb-1">Материал</label>
            <input type="text" placeholder="Описание ссылки" value={materials[0].description} onChange={e => setMaterials([{ ...materials[0], description: e.target.value }])} className="w-full p-2 rounded border bg-transparent mb-2" required />
            <input type="text" placeholder="URL материала" value={materials[0].link} onChange={e => setMaterials([{ ...materials[0], link: e.target.value }])} className="w-full p-2 rounded border bg-transparent" required />
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" id="premiumCheck" checked={isPremium} onChange={e => setIsPremium(e.target.checked)} />
            <label htmlFor="premiumCheck">Требуется Premium подписка</label>
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Создать курс</button>
        </form>
      </div>

      {/* Управление пользователями */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold mb-4">Управление правами пользователей</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="p-2">Имя</th>
                <th className="p-2">Email</th>
                <th className="p-2">Премиум</th>
                <th className="p-2">Действие</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b dark:border-slate-800 text-sm">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.isPremium ? 'Да' : 'Нет'}</td>
                  <td className="p-2">
                    <button onClick={() => handleTogglePremium(u.id)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">
                      Переключить Premium
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Управление курсами */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900">
        <h2 className="text-xl font-bold mb-4">Список курсов (Удаление)</h2>
        <div className="space-y-2">
          {courses.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-3 border rounded">
              <span>{c.title} {c.isPremium && '⭐'}</span>
              <button onClick={() => handleDeleteCourse(c.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Удалить</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
