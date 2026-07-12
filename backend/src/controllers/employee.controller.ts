import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true,
          }
        },
        createdAt: true,
      }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const promoteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['Admin', 'Asset Manager', 'Department Head', 'Employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    res.json({ message: 'Role updated successfully', employee });
  } catch (error) {
    console.error('Error promoting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const assignDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { departmentId } = req.body;

    const employee = await prisma.employee.update({
      where: { id },
      data: { departmentId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentId: true,
      }
    });

    res.json({ message: 'Department assigned successfully', employee });
  } catch (error) {
    console.error('Error assigning department:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
