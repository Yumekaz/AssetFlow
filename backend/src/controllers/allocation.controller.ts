import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const allocateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, employeeId, departmentId } = req.body;

    if (!assetId || !employeeId) {
      return res.status(400).json({ error: 'assetId and employeeId are required' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (asset.isBookable) {
      return res.status(400).json({ error: 'Bookable assets cannot be permanently allocated' });
    }
    if (asset.status === 'Allocated') {
      return res.status(400).json({ error: 'Asset is already allocated' });
    }

    // Transaction to update asset and create allocation record
    const result = await prisma.$transaction(async (tx) => {
      const newAllocation = await tx.allocation.create({
        data: {
          assetId,
          employeeId,
          departmentId: departmentId || null,
          status: 'Active',
          createdBy: req.user!.id,
        }
      });

      await tx.asset.update({
        where: { id: assetId },
        data: {
          status: 'Allocated',
          currentHolderId: employeeId,
          currentDepartmentId: departmentId || null,
        }
      });

      return newAllocation;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error allocating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const returnAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Allocation ID

    const allocation = await prisma.allocation.findUnique({ where: { id } });
    if (!allocation) return res.status(404).json({ error: 'Allocation not found' });
    if (allocation.status === 'Returned') {
      return res.status(400).json({ error: 'Asset already returned' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedAlloc = await tx.allocation.update({
        where: { id },
        data: {
          status: 'Returned',
          returnedAt: new Date(),
        }
      });

      await tx.asset.update({
        where: { id: allocation.assetId },
        data: {
          status: 'Available',
          currentHolderId: null,
          // optionally keep currentDepartmentId or clear it
        }
      });

      return updatedAlloc;
    });

    res.json(result);
  } catch (error) {
    console.error('Error returning asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllocations = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let whereClause: any = {};
    if (user.role === 'Employee') {
      whereClause = { employeeId: user.id };
    } else if (user.role === 'Department Head') {
      whereClause = { OR: [{ departmentId: user.departmentId }, { employee: { departmentId: user.departmentId } }] };
    }

    const allocations = await prisma.allocation.findMany({
      where: whereClause,
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        employee: { select: { id: true, name: true } }
      },
      orderBy: { allocatedAt: 'desc' }
    });

    res.json(allocations);
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
