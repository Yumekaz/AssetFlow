import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const startAudit = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: 'name, startDate, and endDate are required' });
    }

    const audit = await prisma.auditCycle.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        createdById: user.id,
        status: 'In Progress',
      }
    });

    res.status(201).json(audit);
  } catch (error) {
    console.error('Error starting audit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const scanAssets = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params; // AuditCycle ID
    const { assetTags } = req.body; // Array of scanned tags, simulating CSV upload

    if (!Array.isArray(assetTags)) {
      return res.status(400).json({ error: 'assetTags must be an array' });
    }

    const audit = await prisma.auditCycle.findUnique({ where: { id } });
    if (!audit) return res.status(404).json({ error: 'Audit cycle not found' });
    if (audit.status !== 'In Progress') return res.status(400).json({ error: 'Audit cycle is closed or not in progress' });

    // Find all expected assets in the DB (for a company-wide audit, we fetch all. If scoped, we fetch by scope)
    let whereClause: any = {};
    if (audit.scopeDepartmentId) {
      whereClause.currentDepartmentId = audit.scopeDepartmentId;
    }

    const expectedAssets = await prisma.asset.findMany({ where: whereClause });
    const scannedAssets = await prisma.asset.findMany({ where: { assetTag: { in: assetTags } } });
    const scannedAssetIds = new Set(scannedAssets.map(a => a.id));

    const auditItemsToCreate = [];

    for (const expected of expectedAssets) {
      const isScanned = scannedAssetIds.has(expected.id);
      
      auditItemsToCreate.push({
        auditCycleId: audit.id,
        assetId: expected.id,
        auditorId: user.id,
        result: isScanned ? 'Verified' : 'Missing',
        notes: isScanned ? 'Scanned successfully' : 'Not found in bulk scan',
      });
    }

    // Insert all items in bulk
    await prisma.auditItem.createMany({
      data: auditItemsToCreate
    });

    res.json({ message: 'Scan processed successfully', itemsProcessed: auditItemsToCreate.length });
  } catch (error) {
    console.error('Error scanning assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const closeAudit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const audit = await prisma.auditCycle.findUnique({ where: { id } });
    if (!audit) return res.status(404).json({ error: 'Audit cycle not found' });
    if (audit.status === 'Closed') return res.status(400).json({ error: 'Audit is already closed' });

    const updatedAudit = await prisma.auditCycle.update({
      where: { id },
      data: { status: 'Closed' }
    });

    res.json(updatedAudit);
  } catch (error) {
    console.error('Error closing audit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAudits = async (req: AuthRequest, res: Response) => {
  try {
    const audits = await prisma.auditCycle.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        auditItems: true
      },
      orderBy: { startDate: 'desc' }
    });

    res.json(audits);
  } catch (error) {
    console.error('Error fetching audits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
