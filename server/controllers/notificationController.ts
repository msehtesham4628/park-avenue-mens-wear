import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  /**
   * GET /api/notifications
   * Public / customer dispatches endpoint
   */
  async getPublic(req: Request, res: Response) {
    try {
      const { email, customerId, category, limit } = req.query;
      const limitNum = limit ? parseInt(limit as string, 10) : 30;

      const notifications = await notificationService.getPublicNotifications({
        email: email as string,
        customerId: customerId as string,
        category: category as string,
        limit: limitNum
      });

      return res.status(200).json({
        success: true,
        data: notifications,
        count: notifications.length,
        message: 'Patron notifications retrieved successfully.'
      });
    } catch (err: any) {
      return res.status(500).json({ 
        success: false, 
        message: err.message || 'Failed to retrieve patron notifications.' 
      });
    }
  },

  /**
   * GET /api/admin/notifications/history
   * Admin operations history and audit log
   */
  async getHistory(req: Request, res: Response) {
    try {
      const { channel, category, orderId, alterationId, recipient, search, page, limit } = req.query;
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 100;
      const skip = (pageNum - 1) * limitNum;

      const result = await notificationService.getNotificationHistory({
        channel: channel as string,
        category: category as string,
        orderId: orderId as string,
        alterationId: alterationId as string,
        recipient: recipient as string,
        search: search as string,
        skip,
        limit: limitNum
      });

      // Calculate aggregated metrics
      const logs = result.logs || [];
      const stats = {
        total: result.total,
        broadcasts: logs.filter(l => l.target === 'all' || l.recipient === 'all').length,
        productAlerts: logs.filter(l => l.category === 'product').length,
        newsDispatches: logs.filter(l => l.category === 'news').length,
        promotions: logs.filter(l => l.category === 'promotion').length,
        inApp: logs.filter(l => l.channel === 'in_app').length,
        email: logs.filter(l => l.channel === 'email').length,
        sms: logs.filter(l => l.channel === 'sms').length,
        whatsapp: logs.filter(l => l.channel === 'whatsapp').length
      };

      return res.status(200).json({
        success: true,
        data: logs,
        stats,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum
        },
        message: 'Notification history loaded.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/admin/notifications/send
   * Broadcast or send any customized notification (Product, News, Announcement, Promotion, Order, Alteration)
   */
  async sendCustom(req: Request, res: Response) {
    try {
      const { 
        channel = 'in_app',
        recipient = 'all', 
        recipientName, 
        subject, 
        title, 
        message, 
        category = 'general',
        target = 'all',
        link,
        productId,
        productName,
        priority = 'standard',
        orderId, 
        alterationId 
      } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Notification message body is required.'
        });
      }

      const effectiveTitle = title || subject || 'Atelier Dispatch';
      const effectiveSubject = subject || title || 'Park Avenue Menswear Update';

      const result = await notificationService.send(channel, {
        recipient,
        recipientName: recipientName || (target === 'all' ? 'All Patrons' : 'Valued Patron'),
        subject: effectiveSubject,
        title: effectiveTitle,
        message: message.trim(),
        notificationType: category === 'product' ? 'PRODUCT_ALERT' :
                          category === 'news' ? 'NEWS_DISPATCH' :
                          category === 'promotion' ? 'PROMOTION' :
                          category === 'announcement' ? 'ANNOUNCEMENT' : 'CUSTOM',
        category,
        target,
        link,
        productId,
        productName,
        priority,
        orderId,
        alterationId
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `Notification dispatched successfully across [${channel}] to [${target === 'all' ? 'All Patrons' : recipient}].`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/notifications/:id/read
   * Mark a notification as read for a customer
   */
  async markRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, customerId } = req.body || {};
      const userIdentifier = (email || customerId || (req as any).user?.email || (req as any).user?.id || '').trim();

      if (!id) {
        return res.status(400).json({ success: false, message: 'Notification ID required' });
      }

      await notificationService.markAsRead(id, userIdentifier);
      return res.status(200).json({ success: true, message: 'Notification marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read for a customer
   */
  async markAllRead(req: Request, res: Response) {
    try {
      const { email, customerId } = req.body || {};
      const userIdentifier = (email || customerId || (req as any).user?.email || (req as any).user?.id || '').trim();

      await notificationService.markAllAsRead(userIdentifier);
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  /**
   * DELETE /api/admin/notifications/:id
   */
  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Notification ID is required' });
      }
      await notificationService.deleteNotification(id);
      return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
