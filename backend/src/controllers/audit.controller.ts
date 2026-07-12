import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logActivity } from '../utils/logger';

export const startAudit = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, startDate, endDate, scopeDepartmentId } = req.body;

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
        scopeDepartmentId: scopeDepartmentId || null,
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

    // Clear existing items in this audit cycle to prevent duplicates on re-scan
    await prisma.auditItem.deleteMany({
      where: { auditCycleId: audit.id }
    });

    const auditItemsToCreate = [];

    for (const expected of expectedAssets) {
      const isScanned = scannedAssetIds.has(expected.id);
      const scannedAsset = scannedAssets.find(a => a.id === expected.id);
      
      auditItemsToCreate.push({
        auditCycleId: audit.id,
        assetId: expected.id,
        auditorId: user.id,
        result: isScanned ? (scannedAsset?.condition === 'Damaged' ? 'Damaged' : 'Verified') : 'Missing',
        notes: isScanned ? `Scanned successfully. Condition: ${scannedAsset?.condition}` : 'Not found in bulk scan',
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

    const audit = await prisma.auditCycle.findUnique({ 
      where: { id },
      include: { auditItems: true }
    });
    if (!audit) return res.status(404).json({ error: 'Audit cycle not found' });
    if (audit.status === 'Closed') return res.status(400).json({ error: 'Audit is already closed' });

    const discrepancies = audit.auditItems.filter(item => item.result === 'Missing' || item.result === 'Damaged');

    const result = await prisma.$transaction(async (tx) => {
      const updatedAudit = await tx.auditCycle.update({
        where: { id },
        data: { status: 'Closed' },
        include: {
          createdBy: { select: { id: true, name: true } },
          auditItems: {
            include: {
              asset: { select: { id: true, name: true, assetTag: true } }
            }
          }
        }
      });

      for (const item of discrepancies) {
        let newStatus = 'Available';
        if (item.result === 'Missing') {
          newStatus = 'Lost';
        } else if (item.result === 'Damaged') {
          newStatus = 'Under Maintenance';
          
          await tx.maintenanceRequest.create({
            data: {
              assetId: item.assetId,
              raisedById: req.user!.id,
              issueDescription: `Auto-generated via Audit: Asset reported as Damaged. Notes: ${item.notes || 'No details'}`,
              priority: 'High',
              status: 'Pending'
            }
          });
        }

        await tx.asset.update({
          where: { id: item.assetId },
          data: { status: newStatus }
        });
      }

      return updatedAudit;
    });

    await logActivity(req.user!.id, 'audit.closed', 'AuditCycle', id, {
      totalItems: audit.auditItems.length,
      discrepanciesCount: discrepancies.length
    });

    res.json({
      audit: result,
      discrepancyReport: {
        totalItems: result.auditItems.length,
        discrepanciesCount: discrepancies.length,
        discrepancies: result.auditItems.filter(item => item.result === 'Missing' || item.result === 'Damaged')
      }
    });
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
