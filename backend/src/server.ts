import express from 'express';
import cors from 'cors';
import { register, login } from './controllers/auth.controller';
import { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse } from './controllers/course.controller';
import { getProfile, getAllUsers, togglePremium } from './controllers/user.controller';
import { authMiddleware, adminMiddleware } from './middleware/auth.middleware';

const app = express();
app.use(cors());
app.use(express.json());

// Трекер онлайн пользователей (In-memory с таймаутом активности 30 секунд)
const activeSessions = new Map<string, number>();

app.use((req, res, next) => {
  const ip = req.ip || 'unknown';
  const tokenIdentifier = req.headers.authorization || ip;
  activeSessions.set(tokenIdentifier, Date.now());
  next();
});

// Периодическая очистка устаревших сессий (раз в 10 секунд)
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of activeSessions.entries()) {
    if (now - timestamp > 30000) {
      activeSessions.delete(key);
    }
  }
}, 10000);

// Эндпоинт для получения счетчика онлайн
app.get('/api/online', (req, res) => {
  return res.json({ count: activeSessions.size });
});

// Открытые эндпоинты аутентификации
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Эндпоинты курсов
app.get('/api/courses', getAllCourses);
app.get('/api/courses/:id', (req, res, next) => {
  // Допускаем чтение без токена для бесплатных курсов, валидация внутри контроллера
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authMiddleware(req, res, next);
  }
  next();
}, getCourseById);

// Защищенные эндпоинты пользователей
app.get('/api/users/profile', authMiddleware, getProfile);

// Эндпоинты администратора
app.post('/api/courses', authMiddleware, adminMiddleware, createCourse);
app.put('/api/courses/:id', authMiddleware, adminMiddleware, updateCourse);
app.delete('/api/courses/:id', authMiddleware, adminMiddleware, deleteCourse);
app.get('/api/users', authMiddleware, adminMiddleware, getAllUsers);
app.patch('/api/users/:id/premium', authMiddleware, adminMiddleware, togglePremium);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
