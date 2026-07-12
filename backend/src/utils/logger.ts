import prisma from './prisma';

export const logActivity = async (
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: any
) => {
  try {
    await prisma.activityLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const sendNotification = async (
  recipientId: string,
  type: string,
  message: string,
  relatedEntityType?: string,
  relatedEntityId?: string
) => {
  try {
    await prisma.notification.create({
      data: {
        recipientId,
        type,
        message,
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
      },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};
