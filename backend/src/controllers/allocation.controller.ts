import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logActivity, sendNotification } from '../utils/logger';

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
      return res.status(400).json({ error: 'Asset is already allocated. Please submit a transfer request instead.', code: 'ALREADY_ALLOCATED' });
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

    await logActivity(req.user!.id, 'asset.allocated', 'Asset', assetId, { employeeId });
    await sendNotification(employeeId, 'Asset Assigned', `Asset ${asset.name} has been assigned to you.`, 'Asset', assetId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Error allocating asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const returnAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Allocation ID

    const allocation = await prisma.allocation.findUnique({ where: { id }, include: { asset: true } });
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
        }
      });

      return updatedAlloc;
    });

    await logActivity(req.user!.id, 'asset.returned', 'Asset', allocation.assetId);

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

export const requestTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, toEmployeeId, toDepartmentId } = req.body;
    const user = req.user!;

    if (!assetId || !toEmployeeId) {
      return res.status(400).json({ error: 'assetId and toEmployeeId are required' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (asset.status !== 'Allocated') {
      return res.status(400).json({ error: 'Asset is not currently allocated' });
    }

    const transferRequest = await prisma.transferRequest.create({
      data: {
        assetId,
        requestedById: user.id,
        fromEmployeeId: asset.currentHolderId,
        fromDepartmentId: asset.currentDepartmentId,
        toEmployeeId,
        toDepartmentId: toDepartmentId || null,
        status: 'Requested',
      }
    });

    if (asset.currentHolderId) {
      await sendNotification(asset.currentHolderId, 'Transfer Requested', `A transfer has been requested for your asset ${asset.name}.`, 'TransferRequest', transferRequest.id);
    }
    await logActivity(user.id, 'transfer.requested', 'TransferRequest', transferRequest.id, { assetId, toEmployeeId });

    res.status(201).json(transferRequest);
  } catch (error) {
    console.error('Error requesting transfer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
