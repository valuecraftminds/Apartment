const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class TechnicianCategory {
  // Get all categories assigned to a technician
  static async findByTechnicianId(technicianId, companyId) {
    const [rows] = await pool.execute(
      `SELECT 
        tc.id,
        tc.technician_id,
        tc.category_id,
        tc.company_id,
        tc.assigned_by,
        tc.assigned_at,
        c.name as category_name,
        c.description as category_description,
        c.icon as category_icon,
        c.color as category_color,
        c.is_active as category_active
      FROM technician_categories tc
      JOIN complaint_categories c ON tc.category_id = c.id
      WHERE tc.technician_id = ? AND tc.company_id = ?
      ORDER BY c.name ASC`,
      [technicianId, companyId]
    );
    return rows;
  }

  // Get all technicians assigned to a category
  static async findByCategoryId(categoryId, companyId) {
    const [rows] = await pool.execute(
      `SELECT 
        tc.id,
        tc.technician_id,
        tc.category_id,
        tc.company_id,
        tc.assigned_by,
        tc.assigned_at,
        u.id as user_id,
        u.firstname,
        u.lastname,
        u.email,
        u.role,
        u.is_active
       FROM technician_categories tc
       JOIN users u ON tc.technician_id = u.id
       WHERE tc.category_id = ? AND tc.company_id = ?
       ORDER BY u.firstname ASC`,
      [categoryId, companyId]
    );
    return rows;
  }

  // Assign categories to technician
  static async assignCategories(technicianId, categoryIds, assignedBy, companyId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Delete existing assignments for this company
      await connection.execute(
        'DELETE FROM technician_categories WHERE technician_id = ? AND company_id = ?',
        [technicianId, companyId]
      );

      // Insert new assignments if any
      if (categoryIds && categoryIds.length > 0) {
        // Create an array of value arrays, each with a unique ID
        const values = categoryIds.map(categoryId => [
          uuidv4(), // Generate unique ID for each row
          technicianId, 
          categoryId, 
          companyId, 
          assignedBy
        ]);
        
        const placeholders = categoryIds.map(() => '(?, ?, ?, ?, ?)').join(', ');
        
        await connection.execute(
          `INSERT INTO technician_categories 
          (id, technician_id, category_id, company_id, assigned_by) 
          VALUES ${placeholders}`,
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

  // Check if technician has category
  static async hasCategory(technicianId, categoryId, companyId) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM technician_categories 
       WHERE technician_id = ? AND category_id = ? AND company_id = ?`,
      [technicianId, categoryId, companyId]
    );
    return rows.length > 0;
  }

  // Get assignment count for technician
  static async getAssignmentCount(technicianId, companyId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count FROM technician_categories WHERE technician_id = ? AND company_id = ?`,
      [technicianId, companyId]
    );
    return rows[0]?.count || 0;
  }

  // Remove specific category assignment from technician
  static async removeAssignment(technicianId, categoryId, companyId) {
    const [result] = await pool.execute(
      'DELETE FROM technician_categories WHERE technician_id = ? AND category_id = ? AND company_id = ?',
      [technicianId, categoryId, companyId]
    );
    return result.affectedRows > 0;
  }

  // Get all assignments with technician and category details
  static async getAllAssignments(companyId) {
    const [rows] = await pool.execute(
      `SELECT 
        tc.id as assignment_id,
        tc.assigned_at,
        u.id as technician_id,
        u.firstname as technician_firstname,
        u.lastname as technician_lastname,
        u.email as technician_email,
        u.role as technician_role,
        c.id as category_id,
        c.name as category_name,
        c.description as category_description,
        ass.firstname as assigned_by_firstname,
        ass.lastname as assigned_by_lastname
       FROM technician_categories tc
       JOIN users u ON tc.technician_id = u.id
       JOIN complaint_categories c ON tc.category_id = c.id
       LEFT JOIN users ass ON tc.assigned_by = ass.id
       WHERE tc.company_id = ?
       ORDER BY tc.assigned_at DESC`,
      [companyId]
    );
    return rows;
  }

  // Get technicians by multiple categories (for filtering)
  static async findTechniciansByCategories(categoryIds, companyId) {
    if (!categoryIds || categoryIds.length === 0) return [];
    
    const placeholders = categoryIds.map(() => '?').join(', ');
    const [rows] = await pool.execute(
      `SELECT DISTINCT
        u.id,
        u.firstname,
        u.lastname,
        u.email,
        u.phone,
        u.is_active
       FROM technician_categories tc
       JOIN users u ON tc.technician_id = u.id
       WHERE tc.category_id IN (${placeholders})
       AND tc.company_id = ?
       AND u.is_active = 1`,
      [...categoryIds, companyId]
    );
    return rows;
  }
}

module.exports = TechnicianCategory;