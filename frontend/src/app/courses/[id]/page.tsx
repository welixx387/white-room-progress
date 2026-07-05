'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses/${params.id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) return setError(data);
        setCourse(data);
      })
      .catch(err => console.error(err));
  }, [params.id, token]);

  if (error && error.isLocked) {
    return (
      <div className="max-w-2xl mx-auto text-center mt-12 p-8 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-slate-900 rounded-2xl">
        <h2 className="text-2xl font-bold text-amber-700 dark:text-amber-400 mb-4">Доступ ограничен 🔒</h2>
        <p className="mb-6 text-slate-600 dark:text-slate-400">Курс «{error.title}» доступен исключительно для Premium-подписчиков.</p>
        <Link href="/profile" className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium">
          Активировать Premium в ЛК
        </Link>
      </div>
    );
  }

  if (!course) return <p className="text-center">Загрузка данных...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <img src={course.coverImage} alt={course.title} className="w-full h-64 object-cover rounded-2xl mb-6 shadow-sm" />
      <h1 className="text-3xl font-extrabold mb-4">{course.title}</h1>
      <hr className="border-slate-200 dark:border-slate-800 mb-6" />
      
      <h2 className="text-xl font-bold mb-4">Материалы для обучения</h2>
      <div className="space-y-3">
        {course.materials?.map((mat: any, idx: number) => (
          <a key={idx} href={mat.link} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900 transition-all">
            <div className="font-semibold text-blue-600 dark:text-blue-400">{mat.description}</div>
            <div className="text-xs text-slate-400 truncate mt-1">{mat.link}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
