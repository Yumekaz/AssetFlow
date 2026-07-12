import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logActivity, sendNotification } from '../utils/logger';

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { assetId, startTime, endTime } = req.body;

    if (!assetId || !startTime || !endTime) {
      return res.status(400).json({ error: 'assetId, startTime, and endTime are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'endTime must be after startTime' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });
    if (!asset.isBookable) return res.status(400).json({ error: 'Asset is not bookable' });

    // Wrap in a Serializable transaction to prevent race conditions
    const booking = await prisma.$transaction(async (tx) => {
      // Check for overlap conflicts (only against Approved bookings)
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          assetId,
          status: 'Approved',
          AND: [
            { startTime: { lt: end } },
            { endTime: { gt: start } }
          ]
        }
      });

      if (overlappingBooking) {
        throw new Error('Booking conflict: The asset is already booked for this time slot.');
      }

      return await tx.booking.create({
        data: {
          assetId,
          bookedById: user.id,
          startTime: start,
          endTime: end,
          status: 'Pending',
        }
      });
    }, {
      isolationLevel: 'Serializable'
    });

    await logActivity(user.id, 'booking.created', 'Booking', booking.id, { assetId, startTime, endTime });

    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message.includes('Booking conflict')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveBooking = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status !== 'Pending') return res.status(400).json({ error: 'Booking is not pending' });

    // Verify Department Head matches asset department
    if (user.role === 'Department Head') {
      if (booking.asset.currentDepartmentId !== user.departmentId) {
        return res.status(403).json({ error: 'Forbidden: Can only approve bookings for your department' });
      }
    }

    // Wrap in Serializable transaction
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const overlappingBooking = await tx.booking.findFirst({
        where: {
          assetId: booking.assetId,
          status: 'Approved',
          AND: [
            { startTime: { lt: booking.endTime } },
            { endTime: { gt: booking.startTime } }
          ]
        }
      });

      if (overlappingBooking) {
        throw new Error('Booking conflict: Time slot was taken while this was pending.');
      }

      return await tx.booking.update({
        where: { id },
        data: {
          status: 'Approved',
          approvedById: user.id,
        }
      });
    }, {
      isolationLevel: 'Serializable'
    });

    await logActivity(user.id, 'booking.approved', 'Booking', id);
    await sendNotification(booking.bookedById, 'Booking Confirmed', `Your booking for ${booking.asset.name} has been approved.`, 'Booking', id);

    res.json(updatedBooking);
  } catch (error: any) {
    if (error.message.includes('Booking conflict')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('Error approving booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectBooking = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (user.role === 'Department Head') {
      if (booking.asset.currentDepartmentId !== user.departmentId) {
        return res.status(403).json({ error: 'Forbidden: Can only reject bookings for your department' });
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'Rejected',
        approvedById: user.id, // recorded as the decider
      }
    });

    await logActivity(user.id, 'booking.rejected', 'Booking', id);
    await sendNotification(booking.bookedById, 'Booking Rejected', `Your booking for ${booking.asset.name} has been rejected.`, 'Booking', id);

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    let whereClause: any = {};
    if (user.role === 'Employee') {
      whereClause = { bookedById: user.id };
    } else if (user.role === 'Department Head') {
      whereClause = {
        OR: [
          { asset: { currentDepartmentId: user.departmentId } },
          { bookedBy: { departmentId: user.departmentId } }
        ]
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        asset: { select: { id: true, name: true, assetTag: true } },
        bookedBy: { select: { id: true, name: true } },
        // Since we added approvedById as String but didn't add the relation manually in prisma yet?
        // Wait, did I add the relation to Employee for approvedBy in schema.prisma? 
        // No, I just added approvedById String?. Include approvedBy relation will fail if it's not defined.
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
