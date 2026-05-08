import pool from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

/*
|--------------------------------------------------------------------------
| POST /api/hr/notify-all
|--------------------------------------------------------------------------
*/
export const notifyAll = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { notification_type, message } = req.body;
    const hrId = req.user.id;

    const allowedTypes = ['Placement', 'Result', 'Event'];
    if (!notification_type || !allowedTypes.includes(notification_type)) {
      return res.status(400).json({
        success: false,
        message: 'notification_type must be Placement, Result or Event.',
      });
    }
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required.',
      });
    }

    const [students] = await pool.query(
      "SELECT id FROM users WHERE role = 'student' AND is_active = 1"
    );

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No active students found.',
        data: { notificationId: null, recipientCount: 0 },
      });
    }

    await connection.beginTransaction();

    const notificationId = uuidv4();
    await connection.query(
      `INSERT INTO notifications (id, created_by, notification_type, message, total_recipients)
       VALUES (?, ?, ?, ?, ?)`,
      [notificationId, hrId, notification_type, message.trim(), students.length]
    );

    const snValues = students.map((s) => [notificationId, s.id]);
    await connection.query(
      'INSERT INTO student_notifications (notification_id, student_id) VALUES ?',
      [snValues]
    );

    const queueValues = [];
    for (const s of students) {
      queueValues.push([notificationId, s.id, 'email']);
      queueValues.push([notificationId, s.id, 'in_app']);
    }
    await connection.query(
      'INSERT INTO notification_queue (notification_id, student_id, channel) VALUES ?',
      [queueValues]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `Notification queued for ${students.length} student(s).`,
      data: {
        notificationId,
        recipientCount: students.length,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/hr/notify-selected
|--------------------------------------------------------------------------
*/
export const notifySelected = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { notification_type, message, student_ids } = req.body;
    const hrId = req.user.id;

    const allowedTypes = ['Placement', 'Result', 'Event'];
    if (!notification_type || !allowedTypes.includes(notification_type)) {
      return res.status(400).json({
        success: false,
        message: 'notification_type must be Placement, Result or Event.',
      });
    }
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required.',
      });
    }
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'student_ids must be a non-empty array.',
      });
    }

    await connection.beginTransaction();

    const notificationId = uuidv4();
    await connection.query(
      `INSERT INTO notifications (id, created_by, notification_type, message, total_recipients)
       VALUES (?, ?, ?, ?, ?)`,
      [notificationId, hrId, notification_type, message.trim(), student_ids.length]
    );

    const snValues = student_ids.map((id) => [notificationId, id]);
    await connection.query(
      'INSERT INTO student_notifications (notification_id, student_id) VALUES ?',
      [snValues]
    );

    const queueValues = [];
    for (const id of student_ids) {
      queueValues.push([notificationId, id, 'email']);
      queueValues.push([notificationId, id, 'in_app']);
    }
    await connection.query(
      'INSERT INTO notification_queue (notification_id, student_id, channel) VALUES ?',
      [queueValues]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `Notification queued for ${student_ids.length} student(s).`,
      data: { notificationId, recipientCount: student_ids.length },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/hr/history
| Query params: page, limit, notification_type
|--------------------------------------------------------------------------
*/
export const getHistory = async (req, res, next) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const type   = req.query.notification_type;

    const allowedTypes = ['Placement', 'Result', 'Event'];

    let whereClause = 'WHERE n.created_by = ?';
    const params    = [req.user.id];

    if (type && allowedTypes.includes(type)) {
      whereClause += ' AND n.notification_type = ?';
      params.push(type);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM notifications n ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         n.id,
         n.notification_type AS type,
         n.message,
         n.total_recipients,
         n.created_at,
         SUM(CASE WHEN dl.status = 'sent'   THEN 1 ELSE 0 END) AS sent_count,
         SUM(CASE WHEN dl.status = 'failed' THEN 1 ELSE 0 END) AS failed_count
       FROM notifications n
       LEFT JOIN notification_delivery_log dl ON dl.notification_id = n.id
       ${whereClause}
       GROUP BY n.id
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
| GET /api/hr/students
|--------------------------------------------------------------------------
*/
export const getAllStudents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE role = 'student' AND is_active = 1 ORDER BY name ASC"
    );

    return res.status(200).json({
      success: true,
      data: { students: rows },
    });
  } catch (error) {
    next(error);
  }
};