import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAllCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка получения списка курсов.' });
  }
};

export const getCourseById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return res.status(404).json({ message: 'Курс не найден.' });
    }

    // Проверка доступа к премиум контенту
    if (course.isPremium && (!req.user || !req.user.isPremium && !req.user.isAdmin)) {
      return res.status(403).json({ 
        message: 'Этот курс доступен только Premium-пользователям.',
        isLocked: true,
        title: course.title,
        coverImage: course.coverImage
      });
    }

    return res.json(course);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка получения курса.' });
  }
};

export const createCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, coverImage, materials, isPremium } = req.body;
    const newCourse = await prisma.course.create({
      data: { title, coverImage, materials: materials || [], isPremium: !!isPremium }
    });
    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка создания курса.' });
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, coverImage, materials, isPremium } = req.body;
    const updated = await prisma.course.update({
      where: { id },
      data: { title, coverImage, materials, isPremium }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка обновления курса.' });
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    return res.json({ message: 'Курс успешно удален.' });
  } catch (error) {
    return res.status(500).json({ message: 'Ошибка удаления курса.' });
  }
};
