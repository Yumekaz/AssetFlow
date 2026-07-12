import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardKPIs = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const assetScope = user.role === 'Department Head'
      ? { OR: [{ currentDepartmentId: user.departmentId }, { currentHolder: { departmentId: user.departmentId } }] }
      : user.role === 'Employee' ? { currentHolderId: user.id } : {};
    
    const assetsAvailable = await prisma.asset.count({
      where: { ...assetScope, status: 'Available' }
    });

    const assetsAllocated = await prisma.asset.count({
      where: { ...assetScope, status: 'Allocated' }
    });

    const maintenanceCount = await prisma.maintenanceRequest.count({
      where: { status: 'Pending' } // Or 'In Progress' / 'Approved'
    });

    const activeBookings = await prisma.booking.count({
      where: { status: { in: ['Pending', 'Approved', 'Ongoing'] } }
    });

    const overdueReturns = await prisma.allocation.count({
      where: {
        status: 'Active',
        expectedReturnDate: { lt: new Date() }
      }
    });

    const pendingTransfers = await prisma.transferRequest.count({
      where: { status: 'Requested' }
    });

    const upcomingReturns = await prisma.allocation.count({
      where: {
        status: 'Active',
        expectedReturnDate: { gte: new Date() }
      }
    });

    res.json({
      assetsAvailable,
      assetsAllocated,
      maintenanceCount,
      activeBookings,
      overdueReturns,
      pendingTransfers,
      upcomingReturns,
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
