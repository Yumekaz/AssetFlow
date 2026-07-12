import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logActivity, sendNotification } from '../utils/logger';

export const raiseRequest = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { assetId, issueDescription, priority } = req.body;

    if (!assetId || !issueDescription || !priority) {
      return res.status(400).json({ error: 'assetId, issueDescription, and priority are required' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const maintenance = await prisma.maintenanceRequest.create({
      data: {
        assetId,
        raisedById: user.id,
        issueDescription,
        priority, // Low, Medium, High, Critical
        status: 'Pending',
      }
    });

    await logActivity(user.id, 'maintenance.raised', 'MaintenanceRequest', maintenance.id);

    res.status(201).json(maintenance);
  } catch (error) {
    console.error('Error raising maintenance request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;

    const maintenance = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!maintenance) return res.status(404).json({ error: 'Maintenance request not found' });
    if (maintenance.status !== 'Pending') return res.status(400).json({ error: 'Request is not pending' });

    const result = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedById: user.id,
        }
      });

      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: {
          status: 'In Maintenance'
        }
      });

      return updatedReq;
    });

    await logActivity(user.id, 'maintenance.approved', 'MaintenanceRequest', id);
    await sendNotification(maintenance.raisedById, 'Maintenance Approved', `Your maintenance request for asset ${maintenance.assetId} is approved.`, 'MaintenanceRequest', id);

    res.json(result);
  } catch (error) {
    console.error('Error approving maintenance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const resolveRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const maintenance = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!maintenance) return res.status(404).json({ error: 'Maintenance request not found' });
    if (maintenance.status !== 'Approved') return res.status(400).json({ error: 'Request is not currently approved/in-progress' });

    const result = await prisma.$transaction(async (tx) => {
      const updatedReq = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: 'Resolved',
          resolvedAt: new Date(),
        }
      });

      // Optionally, we could check if it was allocated to someone before maintenance 
      // but for simplicity, we just return it to Available or whatever logic.
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: {
          status: 'Available' // Or could keep as 'Allocated' if still held by someone
        }
      });

      return updatedReq;
    });

    await logActivity(req.user!.id, 'maintenance.resolved', 'MaintenanceRequest', id);
    await sendNotification(maintenance.raisedById, 'Maintenance Resolved', `Your maintenance request for asset ${maintenance.assetId} has been resolved.`, 'MaintenanceRequest', id);

    res.json(result);
  } catch (error) {
    console.error('Error resolving maintenance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRequests = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let whereClause: any = {};
    if (user.role === 'Employee') {
      whereClause = { raisedById: user.id };
    } // Admins / Asset Managers see all. Dept Heads might see their dept, but we'll simplify.

    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        raisedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
