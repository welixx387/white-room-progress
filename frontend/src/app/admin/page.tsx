'use client';

import { useState, useEffect } from 'react';

interface Course {
  id: string;
  title: string;
  imageUrl: string;
  material: string;
  link: string;
  isPremium: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
}

export default function AdminPage() {
  // Состояния для формы создания курса
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [material, setMaterial] = useState('');
  const [link, setLink] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  // Состояния для списков данных
  const [courses, setCourses] = useState<Course[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Берем базовый URL из переменных окружения Vercel
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Загрузка курсов и пользователей при кате страницы
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Загрузка курсов
      const coursesRes = await fetch(`${API_URL}/courses`);
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data);
      }

      // Загрузка пользователей (если бэкенд поддерживает эндпоинт /users)
      const usersRes = await fetch(`${API_URL}/users`);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Ошибка при получении данных с сервера:', error);
    }
  };

  // Хэндлер отправки формы курса
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', isError: false });

    try {
      // ИСПРАВЛЕНО: Запрос идет на сервер Render через переменную окружения
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Если бэкенд защищен, раскомментируй строчку ниже для передачи токена:
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title,
          imageUrl,
          material,
          link,
          isPremium,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Не удалось создать курс');
      }

      setMessage({ text: 'Курс успешно создан!', isError: false });
      
      // Очистка полей формы
      setTitle('');
      setImageUrl('');
      setMaterial('');
      setLink('');
      setIsPremium(false);

      // Обновляем список курсов на странице
      fetchData();
    } catch (error: any) {
      setMessage({ text: error.message || 'Произошла ошибка при создании курса', isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Функция удаления курса
  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот курс?')) return;

    try {
      const response = await fetch(`${API_URL}/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Ошибка при удалении курса:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Администрирование платформы</h1>

        {/* Уведомления об успехе или ошибке */}
        {message.text && (
          <div className={`p-4 mb-6 rounded text-sm ${message.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
            {message.text}
          </div>
        )}

        {/* Форма: Создать новый курс */}
        <div className="bg-[#0f1524] border border-[#1e293b] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Создать новый курс</h2>
          
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Название курса (например: Японский)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#161f32] border border-[#24334d] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <input
                type="url"
                placeholder="Ссылка на обложку курса (URL картинки)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
                className="w-full bg-[#161f32] border border-[#24334d] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Материал</label>
              <input
                type="text"
                placeholder="Описание материала (например: Курс японского N1)"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                required
                className="w-full bg-[#161f32] border border-[#24334d] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <input
                type="url"
                placeholder="Ссылка на плейлист/видео (YouTube)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                required
                className="w-full bg-[#161f32] border border-[#24334d] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                type="checkbox"
                id="isPremium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="w-4 h-4 rounded bg-[#161f32] border-[#24334d] text-blue-600 focus:ring-0 focus:ring-offset-0"
              />
              <label htmlFor="isPremium" className="text-sm select-none cursor-pointer text-gray-300">
                Требуется Premium подписка
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#10b981] hover:bg-[#059669] text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать курс'}
            </button>
          </form>
        </div>

        {/* Таблица: Управление правами */}
        <div className="bg-[#0f1524] border border-[#1e293b] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Управление правами пользователей</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs uppercase bg-[#161f32] text-gray-300">
                <tr>
                  <th className="px-4 py-3">Имя</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Премиум</th>
                  <th className="px-4 py-3">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-gray-500">Нет зарегистрированных пользователей</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#131b2e]">
                      <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">{user.isPremium ? '💎 Да' : 'Нет'}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-400 hover:underline">Изменить статус</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Список курсов для удаления */}
        <div className="bg-[#0f1524] border border-[#1e293b] rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Список курсов (Удаление)</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500 text-sm">Список курсов пуст</p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-[#161f32] rounded-lg border border-[#24334d]">
                  <div>
                    <span className="font-medium text-white">{course.title}</span>
                    <span className="text-xs text-gray-500 ml-3">({course.material})</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="text-red-400 hover:text-red-500 text-sm font-medium transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
