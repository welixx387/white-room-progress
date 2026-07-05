'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  coverImage: string;
  isPremium: boolean;
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/courses`)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(console.error);
  }, []);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase());
    if (filter === 'free') return matchesSearch && !course.isPremium;
    if (filter === 'premium') return matchesSearch && course.isPremium;
    return matchesSearch;
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold mb-8 text-slate-800 dark:text-slate-100">Каталог курсов</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Поиск по названию..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow p-2.5 rounded border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 outline-none focus:border-blue-500"
        />
        <select 
          value={filter} 
          onChange={(e: any) => setFilter(e.target.value)}
          className="p-2.5 rounded border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 outline-none focus:border-blue-500"
        >
          <option value="all">Все курсы</option>
          <option value="free">Бесплатные</option>
          <option value="premium">Премиум</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col">
            <img src={course.coverImage || '/placeholder.png'} alt={course.title} className="w-full h-48 object-cover" />
            <div className="p-5 flex flex-col flex-grow justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  {course.isPremium ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">PREMIUM</span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300">Свободный доступ</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{course.title}</h3>
              </div>
              <Link href={`/courses/${course.id}`} className="w-full text-center py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                Открыть курс
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
