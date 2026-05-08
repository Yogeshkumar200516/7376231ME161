import pool from '../config/config.js';

/*
|--------------------------------------------------------------------------
| GET /api/student/profile
|--------------------------------------------------------------------------
*/
export const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { student: rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET /api/student/unread-count
|--------------------------------------------------------------------------
*/
export const getUnreadCount = async (req, res, next) => {
  try {
    const [[{ count }]] = await pool.query(
      `SELECT COUNT(*) AS count
       FROM student_notifications
       WHERE student_id = ? AND is_read = 0`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};