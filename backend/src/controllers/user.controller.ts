import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден.' });
    
    const { password, ...userData } = user;
    return res.json(userData);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка сервера при получении профиля.' });
  }
};

export const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id:专, email: true, name: true, isAdmin: true, isPremium: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    // Исправление синтаксиса для валидного JS: id: true
    const fixedUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true, isAdmin: true, isPremium: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(fixedUsers);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка получения списка пользователей.' });
  }
};

export const togglePremium = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден.' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isPremium: !user.isPremium },
      select: { id: true, name: true, isPremium: true }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка изменения статуса.' });
  }
};
