/**
 * Notification Service for Creomotion
 * 
 * Handles:
 * - In-app notifications
 * - Email notifications (placeholder)
 * - Activity logging
 */

import { prisma } from './db';

export interface NotificationOptions {
  type: 'IN_APP' | 'EMAIL';
  recipientId: string;
  recipientType: 'USER' | 'CLIENT';
  projectId?: string;
  deliverableId?: string;
  message: string;
  metadata?: Record<string, any>;
}

/**
 * Send notification to user or client
 */
export async function sendNotification(options: NotificationOptions): Promise<void> {
  const { type, recipientId, recipientType, projectId, deliverableId, message, metadata } = options;

  if (type === 'IN_APP') {
    // Create in-app notification in database
    // Note: Create Notification model if you want persistent notifications
    console.log('In-app notification:', {
      recipientId,
      recipientType,
      message,
      projectId,
      deliverableId,
    });
  }

  if (type === 'EMAIL') {
    // Queue email via Inngest or direct send
    // This is a placeholder - implement with your email provider
    console.log('Email notification:', {
      to: recipientId,
      message,
    });
  }
}

/**
 * Log activity for project timeline
 */
export async function logActivity(data: {
  projectId: string;
  type: string;
  description: string;
  actorId: string;
  actorType: 'USER' | 'CLIENT' | 'SYSTEM';
  metadata?: Record<string, any>;
}): Promise<void> {
  // Create Activity model in Prisma if you want activity tracking
  console.log('Activity logged:', data);
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(
  options: Omit<NotificationOptions, 'recipientId'> & { recipientIds: string[] }
): Promise<void> {
  const { recipientIds, ...restOptions } = options;
  
  await Promise.all(
    recipientIds.map((id) =>
      sendNotification({ ...restOptions, recipientId: id })
    )
  );
}
