import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, parentDepartmentId, departmentHeadId } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const department = await prisma.department.create({
      data: {
        name,
        parentDepartmentId: parentDepartmentId || null,
        departmentHeadId: departmentHeadId || null,
      },
    });

    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parentDepartment: { select: { id: true, name: true } },
        departmentHead: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentDepartmentId, departmentHeadId, status } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        parentDepartmentId,
        departmentHeadId,
        status,
      },
    });

    res.json(department);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Soft delete to preserve relational integrity
    const department = await prisma.department.update({
      where: { id },
      data: { status: 'Inactive' },
    });

    res.json({ message: 'Department marked as inactive', department });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
