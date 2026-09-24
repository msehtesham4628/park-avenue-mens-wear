import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService.js';

export const notificationController = {
  /**
   * GET /api/admin/notifications/history
   */
  async getHistory(req: Request, res: Response) {
    try {
      const { channel, orderId, alterationId, recipient, page, limit } = req.query;
      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 50;
      const skip = (pageNum - 1) * limitNum;

      const result = await notificationService.getNotificationHistory({
        channel: channel as string,
        orderId: orderId as string,
        alterationId: alterationId as string,
        recipient: recipient as string,
        skip,
        limit: limitNum
      });

      return res.status(200).json({
        success: true,
        data: result.logs,
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
   */
  async sendCustom(req: Request, res: Response) {
    try {
      const { channel, recipient, recipientName, subject, message, orderId, alterationId } = req.body;

      if (!channel || !recipient || !message) {
        return res.status(400).json({
          success: false,
          message: 'channel (email|sms|whatsapp), recipient, and message are required.'
        });
      }

      const result = await notificationService.send(channel, {
        recipient,
        recipientName,
        subject: subject || 'Park Avenue Menswear Concierge Notice',
        message,
        notificationType: 'CUSTOM',
        orderId,
        alterationId
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `Notification dispatched via ${channel}.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
};
