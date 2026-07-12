import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardKPIs = async (req: AuthRequest, res: Response) => {
  try {
    // In a real multi-tenant app, these would be scoped.
    // We can also scope them by role (e.g. Dept Head sees only their dept's stats)
    // but for the hackathon we'll just compute org-wide stats for simplicity.
    
    const assetsAvailable = await prisma.asset.count({
      where: { status: 'Available' }
    });

    const assetsAllocated = await prisma.asset.count({
      where: { status: 'Allocated' }
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

    res.json({
      assetsAvailable,
      assetsAllocated,
      maintenanceCount,
      activeBookings,
      overdueReturns,
    });
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
