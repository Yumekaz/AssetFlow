import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, customFields } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.assetCategory.create({
      data: {
        name,
        customFields: customFields ? JSON.stringify(customFields) : null,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.assetCategory.findMany();
    // Parse customFields back to JSON object for response
    const formattedCategories = categories.map(cat => ({
      ...cat,
      customFields: cat.customFields ? JSON.parse(cat.customFields) : null
    }));
    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, customFields } = req.body;

    const category = await prisma.assetCategory.update({
      where: { id },
      data: {
        name,
        ...(customFields !== undefined && { customFields: customFields ? JSON.stringify(customFields) : null }),
      },
    });

    res.json({
      ...category,
      customFields: category.customFields ? JSON.parse(category.customFields) : null
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Typically you'd check for existing assets under this category before deleting.
    // For now, allow simple delete or soft delete. Let's do hard delete for categories.
    await prisma.assetCategory.delete({
      where: { id },
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
