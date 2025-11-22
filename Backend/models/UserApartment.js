//models/UserApartment.js
const pool = require('../db');

class UserApartment {
  // Get all apartments assigned to a user
  static async findByUserId(userId) {
    const [rows] = await pool.execute(
      `SELECT 
        a.id, 
        a.name, 
        a.address, 
        a.city, 
        a.floors, 
        a.houses, 
        a.is_active,
        a.picture,
        ua.assigned_at
       FROM user_apartments ua
       JOIN apartments a ON ua.apartment_id = a.id
       WHERE ua.user_id = ?
       ORDER BY a.name ASC`,
      [userId]
    );
    return rows;
  }

  // Get all users assigned to an apartment
  static async findByApartmentId(apartmentId) {
    const [rows] = await pool.execute(
      `SELECT 
        u.id, 
        u.firstname, 
        u.lastname, 
        u.email,
        u.role,
        u.is_active,
        ua.assigned_at
       FROM user_apartments ua
       JOIN users u ON ua.user_id = u.id
       WHERE ua.apartment_id = ?
       ORDER BY u.firstname ASC`,
      [apartmentId]
    );
    return rows;
  }

  // Assign apartments to user
  static async assignApartments(userId, apartmentIds, assignedBy) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete existing assignments
      await connection.execute(
        'DELETE FROM user_apartments WHERE user_id = ?',
        [userId]
      );

      // Insert new assignments if any
      if (apartmentIds && apartmentIds.length > 0) {
        const values = apartmentIds.map(apartmentId => [userId, apartmentId, assignedBy]);
        const placeholders = apartmentIds.map(() => '(?, ?, ?)').join(', ');
        
        await connection.execute(
          `INSERT INTO user_apartments (user_id, apartment_id, assigned_by) VALUES ${placeholders}`,
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

  // Check if user has access to apartment
  static async hasAccess(userId, apartmentId) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM user_apartments 
       WHERE user_id = ? AND apartment_id = ?`,
      [userId, apartmentId]
    );
    return rows.length > 0;
  }

  // Get assignment count for user
  static async getAssignmentCount(userId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM user_apartments WHERE user_id = ?`,
      [userId]
    );
    return rows[0]?.count || 0;
  }

  // Remove specific apartment assignment from user
  static async removeAssignment(userId, apartmentId) {
    const [result] = await pool.execute(
      'DELETE FROM user_apartments WHERE user_id = ? AND apartment_id = ?',
      [userId, apartmentId]
    );
    return result.affectedRows > 0;
  }

  // Get all assignments with user and apartment details
  static async getAllAssignments(companyId) {
    const [rows] = await pool.execute(
      `SELECT 
        ua.id as assignment_id,
        ua.assigned_at,
        u.id as user_id,
        u.firstname,
        u.lastname,
        u.email,
        u.role,
        a.id as apartment_id,
        a.name as apartment_name,
        a.address,
        ass.firstname as assigned_by_firstname,
        ass.lastname as assigned_by_lastname
       FROM user_apartments ua
       JOIN users u ON ua.user_id = u.id
       JOIN apartments a ON ua.apartment_id = a.id
       JOIN users ass ON ua.assigned_by = ass.id
       WHERE u.company_id = ? OR a.company_id = ?
       ORDER BY ua.assigned_at DESC`,
      [companyId, companyId]
    );
    return rows;
  }
}

module.exports = UserApartment;