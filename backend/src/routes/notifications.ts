import { Router, Request, Response, NextFunction } from 'express';
import { sequelize } from '../config/database';
import { DataTypes } from 'sequelize';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Notification model (created dynamically)
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  table_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  record_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  email_template: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

// Ensure table exists
Notification.sync();

// Function to trigger notification (called from route factory)
export async function triggerNotification(event: string, tableName: string, recordId: string, userId: string, emailTemplate?: string) {
  try {
    const notification = await Notification.create({
      event_type: event,
      table_name: tableName,
      record_id: recordId,
      email_template: emailTemplate,
      user_id: userId,
    });

    // Mock email sending (in production, use actual email service)
    console.log(`[MOCK EMAIL] Notification triggered:`);
    console.log(`  Event: ${event}`);
    console.log(`  Table: ${tableName}`);
    console.log(`  Record ID: ${recordId}`);
    console.log(`  Template: ${emailTemplate || 'default'}`);
    console.log(`  User ID: ${userId}`);

    // Update status
    await notification.update({ status: 'sent' });
    
    return notification;
  } catch (error) {
    console.error('Failed to trigger notification:', error);
  }
}

// Get notification history
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user!.id },
      order: [['created_at', 'DESC']],
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

export default router;
