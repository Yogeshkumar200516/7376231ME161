import pool from '../config/config.js';

/*
|--------------------------------------------------------------------------
| GET /api/notifications
| Query params: page, limit, notification_type
|--------------------------------------------------------------------------
*/
export const getAllNotifications = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const page      = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit     = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset    = (page - 1) * limit;
    const type      = req.query.notification_type;

    const allowedTypes = ['Placement', 'Result', 'Event'];

    let baseQuery = `
      FROM notifications n
      JOIN student_notifications sn
        ON sn.notification_id = n.id AND sn.student_id = ?
    `;
    const params = [studentId];

    if (type && allowedTypes.includes(type)) {
      baseQuery += ' WHERE n.notification_type = ?';
      params.push(type);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total ${baseQuery}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         n.id,
         n.notification_type AS type,
         n.message,
         n.created_at        AS timestamp,
         sn.is_read,
         sn.read_at,
         sn.delivered_at
       ${baseQuery}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: {
        notifications: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/notifications/priority?n=10
|--------------------------------------------------------------------------
*/
export const getPriorityNotifications = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const n         = Math.min(parseInt(req.query.n) || 10, 50);
    const type      = req.query.notification_type;

    const allowedTypes = ['Placement', 'Result', 'Event'];
    const weightCase   = `
      CASE n.notification_type
        WHEN 'Placement' THEN 3
        WHEN 'Result'    THEN 2
        WHEN 'Event'     THEN 1
        ELSE 0
      END
    `;

    let whereClause = 'WHERE sn.student_id = ? AND sn.is_read = 0';
    const params    = [studentId];

    if (type && allowedTypes.includes(type)) {
      whereClause += ' AND n.notification_type = ?';
      params.push(type);
    }

    const [rows] = await pool.query(
      `SELECT
         n.id,
         n.notification_type  AS type,
         n.message,
         n.created_at         AS timestamp,
         sn.is_read,
         sn.delivered_at,
         (${weightCase})                           AS weight,
         TIMESTAMPDIFF(SECOND, n.created_at, NOW()) AS age_seconds,
         (
           (${weightCase}) * 1000000
           - TIMESTAMPDIFF(SECOND, n.created_at, NOW())
         )                                          AS priority_score
       FROM notifications n
       JOIN student_notifications sn
         ON sn.notification_id = n.id
       ${whereClause}
       ORDER BY priority_score DESC
       LIMIT ?`,
      [...params, n]
    );

    return res.status(200).json({
      success: true,
      data: { notifications: rows },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/notifications/:id
|--------------------------------------------------------------------------
*/
export const getNotificationById = async (req, res, next) => {
  try {
    const studentId      = req.user.id;
    const notificationId = req.params.id;

    const [rows] = await pool.query(
      `SELECT
         n.id,
         n.notification_type AS type,
         n.message,
         n.created_at        AS timestamp,
         sn.is_read,
         sn.read_at,
         sn.delivered_at
       FROM notifications n
       JOIN student_notifications sn
         ON sn.notification_id = n.id
       WHERE n.id = ? AND sn.student_id = ?`,
      [notificationId, studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { notification: rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/notifications/:id/read
|--------------------------------------------------------------------------
*/
export const markAsRead = async (req, res, next) => {
  try {
    const studentId      = req.user.id;
    const notificationId = req.params.id;

    const [result] = await pool.query(
      `UPDATE student_notifications
       SET is_read = 1, read_at = NOW()
       WHERE notification_id = ? AND student_id = ? AND is_read = 0`,
      [notificationId, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already read.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| PATCH /api/notifications/read-all
|--------------------------------------------------------------------------
*/
export const markAllAsRead = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const [result] = await pool.query(
      `UPDATE student_notifications
       SET is_read = 1, read_at = NOW()
       WHERE student_id = ? AND is_read = 0`,
      [studentId]
    );

    return res.status(200).json({
      success: true,
      message: `${result.affectedRows} notification(s) marked as read.`,
    });
  } catch (error) {
    next(error);
  }
};