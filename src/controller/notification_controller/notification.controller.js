const pool = require('../../utils/mysql2Connection');
const jwt = require('jsonwebtoken');
const accessSecretKey = process.env.ACCESS_SECRET_KEY;

/**
 * Get user ID and role from token
 */
function getUserFromToken(req) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return null;
    
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    
    const decoded = jwt.verify(token, accessSecretKey);
    return {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type
    };
  } catch (error) {
    return null;
  }
}

/**
 * GET /api/notifications
 * Get notifications for current user
 */
exports.getNotifications = async (req, res) => {
  let connection;
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    connection = await pool.getConnection();

    // Get notifications based on role
    let query, params;
    if (user.type === 'superadmin') {
      // SuperAdmin gets all notifications targeted to superadmin
      query = `SELECT * FROM notifications 
               WHERE target_role = 'superadmin' 
               ORDER BY created_at DESC 
               LIMIT 50`;
      params = [];
    } else {
      // Admin gets notifications targeted to them
      query = `SELECT * FROM notifications 
               WHERE target_role = 'admin' 
               AND (target_user_id = ? OR target_user_id IS NULL)
               ORDER BY created_at DESC 
               LIMIT 50`;
      params = [user.id];
    }

    const [notifications] = await connection.execute(query, params);

    return res.status(200).json({
      status: true,
      data: notifications,
      message: 'Notifications retrieved successfully'
    });

  } catch (error) {
    console.error('Get notifications error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving notifications'
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
exports.markAsRead = async (req, res) => {
  let connection;
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    const { id } = req.params;

    connection = await pool.getConnection();

    await connection.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      status: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while updating notification'
    });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
exports.getUnreadCount = async (req, res) => {
  let connection;
  try {
    const user = getUserFromToken(req);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: 'Authentication required'
      });
    }

    connection = await pool.getConnection();

    let query, params;
    if (user.type === 'superadmin') {
      query = `SELECT COUNT(*) as count FROM notifications 
               WHERE target_role = 'superadmin' 
               AND is_read = FALSE`;
      params = [];
    } else {
      query = `SELECT COUNT(*) as count FROM notifications 
               WHERE target_role = 'admin' 
               AND (target_user_id = ? OR target_user_id IS NULL)
               AND is_read = FALSE`;
      params = [user.id];
    }

    const [result] = await connection.execute(query, params);

    return res.status(200).json({
      status: true,
      count: result[0].count,
      message: 'Unread count retrieved successfully'
    });

  } catch (error) {
    console.error('Get unread count error:', error.message);
    return res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving unread count'
    });
  } finally {
    if (connection) connection.release();
  }
};

