// models/UserBills.js - Corrected version
const pool = require('../db');

class UserBills {
  // Get all bills assigned to a user
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        b.id, 
        b.bill_name, 
        b.billtype, 
        b.is_metered, 
        ub.assign_at as assigned_at
       FROM user_bills ub
       JOIN bills b ON ub.bill_id = b.id
       WHERE ub.user_id = ?
       ORDER BY b.bill_name ASC`,
      [userId]
    );
    return rows;
  }

  // Get all users assigned to a bill
  static async findByBillId(billId) {
    const [rows] = await pool.execute(
      `SELECT 
        u.id, 
        u.firstname, 
        u.lastname, 
        u.email,
        u.role,
        u.is_active,
        ub.assign_at as assigned_at
       FROM user_bills ub
       JOIN users u ON ub.user_id = u.id
       WHERE ub.bill_id = ?
       ORDER BY u.firstname ASC`,
      [billId]
    );
    return rows;
  }

  // Assign bills to user
  static async assignBills(companyId, userId, billIds, assignedBy) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete existing assignments
      await connection.execute(
        'DELETE FROM user_bills WHERE user_id = ?',
        [userId]
      );

      // Insert new assignments if any
      if (billIds && billIds.length > 0) {
        const values = billIds.map(billId => [companyId, userId, billId, assignedBy]);
        const placeholders = billIds.map(() => '(?, ?, ?, ?)').join(', ');
        
        await connection.execute(
          `INSERT INTO user_bills (company_id, user_id, bill_id, assigned_by) VALUES ${placeholders}`,
          values.flat()
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Check if user has access to bill
  static async hasAccess(userId, billId) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM user_bills 
       WHERE user_id = ? AND bill_id = ?`,
      [userId, billId]
    );
    return rows.length > 0;
  }

  // Get assignment count for user
  static async getAssignmentCount(userId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM user_bills WHERE user_id = ?`,
      [userId]
    );
    return rows[0]?.count || 0;
  }

  // Remove specific bill assignment from user
  static async removeAssignment(userId, billId) {
    const [result] = await pool.execute(
      'DELETE FROM user_bills WHERE user_id = ? AND bill_id = ?',
      [userId, billId]
    );
    return result.affectedRows > 0;
  }

  // Get all assignments with user and bill details
  static async getAllAssignments(companyId) {
    const [rows] = await pool.execute(
      `SELECT 
        ub.id as assignment_id,
        ub.assign_at as assigned_at,
        u.id as user_id,
        u.firstname,
        u.lastname,
        u.email,
        u.role,
        b.id as bill_id,
        b.bill_name,
        b.billtype,
        ass.firstname as assigned_by_firstname,
        ass.lastname as assigned_by_lastname
       FROM user_bills ub
       JOIN users u ON ub.user_id = u.id
       JOIN bills b ON ub.bill_id = b.id
       JOIN users ass ON ub.assigned_by = ass.id
       WHERE ub.company_id = ?
       ORDER BY ub.assign_at DESC`,
      [companyId]
    );
    return rows;
  }
}

module.exports = UserBills;