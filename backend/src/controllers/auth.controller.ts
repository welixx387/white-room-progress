import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения.' });
    }

    const candidate = await prisma.user.findUnique({ where: { email } });
    if (candidate) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Первый зарегистрированный пользователь автоматически становится админом для удобства деплоя
    const userCount = await prisma.user.count();
    const isAdmin = userCount === 0;

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, isAdmin },
    });

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin, isPremium: user.isPremium }, JWT_SECRET, { expiresIn: '24h' });

    return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, isPremium: user.isPremium } });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка сервера при регистрации.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль.' });
    }

    const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin, isPremium: user.isPremium }, JWT_SECRET, { expiresIn: '24h' });

    return res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin, isPremium: user.isPremium } });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка сервера при входе.' });
  }
};
