import pool from '../config/config.js';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_NOTIFICATION_TYPES = ['Placement', 'Result', 'Event'];
const ALLOWED_USER_ROLES = ['hr', 'student'];

const validateNotificationPayload = (notificationType, message) => {
  if (!notificationType || !ALLOWED_NOTIFICATION_TYPES.includes(notificationType)) {
    return 'notification_type must be Placement, Result or Event.';
  }

  if (!message || message.trim() === '') {
    return 'Message is required.';
  }

  return null;
};

const buildNotificationArtifacts = (notificationId, studentIds) => {
  const studentNotificationValues = studentIds.map((studentId) => [notificationId, studentId]);
  const queueValues = [];
  const deliveryLogValues = [];

  for (const studentId of studentIds) {
    queueValues.push([notificationId, studentId, 'email']);
    queueValues.push([notificationId, studentId, 'in_app']);
    deliveryLogValues.push([notificationId, studentId, 'email', 'pending']);
    deliveryLogValues.push([notificationId, studentId, 'in_app', 'pending']);
  }

  return { studentNotificationValues, queueValues, deliveryLogValues };
};

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

    const validationError = validateNotificationPayload(notification_type, message);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    await connection.beginTransaction();

    const [students] = await connection.query(
      "SELECT id FROM users WHERE role = 'student' AND is_active = 1"
    );

    if (students.length === 0) {
      await connection.rollback();
      return res.status(200).json({
        success: true,
        message: 'No active students found.',
        data: { notificationId: null, recipientCount: 0 },
      });
    }

    const notificationId = uuidv4();
    await connection.query(
      `INSERT INTO notifications (id, created_by, notification_type, message, total_recipients)
       VALUES (?, ?, ?, ?, ?)`,
      [notificationId, hrId, notification_type, message.trim(), students.length]
    );

    const studentIds = students.map((student) => student.id);
    const {
      studentNotificationValues,
      queueValues,
      deliveryLogValues,
    } = buildNotificationArtifacts(notificationId, studentIds);

    await connection.query(
      'INSERT INTO student_notifications (notification_id, student_id) VALUES ?',
      [studentNotificationValues]
    );

    await connection.query(
      'INSERT INTO notification_queue (notification_id, student_id, channel) VALUES ?',
      [queueValues]
    );

    await connection.query(
      `INSERT INTO notification_delivery_log
       (notification_id, student_id, channel, status)
       VALUES ?`,
      [deliveryLogValues]
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

    const validationError = validateNotificationPayload(notification_type, message);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'student_ids must be a non-empty array.',
      });
    }

    const normalizedStudentIds = [...new Set(student_ids.filter(Boolean))];
    if (normalizedStudentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'student_ids must contain valid student ids.',
      });
    }

    await connection.beginTransaction();

    const placeholders = normalizedStudentIds.map(() => '?').join(', ');
    const [students] = await connection.query(
      `SELECT id
       FROM users
       WHERE role = 'student'
         AND is_active = 1
         AND id IN (${placeholders})`,
      normalizedStudentIds
    );

    if (students.length !== normalizedStudentIds.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'One or more student_ids are invalid or inactive.',
      });
    }

    const notificationId = uuidv4();
    await connection.query(
      `INSERT INTO notifications (id, created_by, notification_type, message, total_recipients)
       VALUES (?, ?, ?, ?, ?)`,
      [notificationId, hrId, notification_type, message.trim(), students.length]
    );

    const studentIds = students.map((student) => student.id);
    const {
      studentNotificationValues,
      queueValues,
      deliveryLogValues,
    } = buildNotificationArtifacts(notificationId, studentIds);

    await connection.query(
      'INSERT INTO student_notifications (notification_id, student_id) VALUES ?',
      [studentNotificationValues]
    );

    await connection.query(
      'INSERT INTO notification_queue (notification_id, student_id, channel) VALUES ?',
      [queueValues]
    );

    await connection.query(
      `INSERT INTO notification_delivery_log
       (notification_id, student_id, channel, status)
       VALUES ?`,
      [deliveryLogValues]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `Notification queued for ${students.length} student(s).`,
      data: { notificationId, recipientCount: students.length },
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

    let whereClause = 'WHERE n.created_by = ?';
    const params    = [req.user.id];

    if (type && ALLOWED_NOTIFICATION_TYPES.includes(type)) {
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
         SUM(CASE WHEN dl.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
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

/*
|--------------------------------------------------------------------------
| GET /api/hr/users
|--------------------------------------------------------------------------
*/
export const getAllUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const params = [];
    let whereClause = '';

    if (role && ALLOWED_USER_ROLES.includes(role)) {
      whereClause = 'WHERE role = ?';
      params.push(role);
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return res.status(200).json({
      success: true,
      data: { users: rows },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| POST /api/hr/users
|--------------------------------------------------------------------------
*/
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedName = name?.trim();
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedRole = role?.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
      });
    }

    if (!ALLOWED_USER_ROLES.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be hr or student.',
      });
    }

    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
      });
    }

    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, normalizedName, normalizedEmail, password.trim(), normalizedRole]
    );

    const [rows] = await pool.query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user: rows[0] },
    });
  } catch (error) {
    next(error);
  }
};
