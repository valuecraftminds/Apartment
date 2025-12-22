//models/FloorDocument.js
const pool = require('../db');

class FloorDocument {
  // Create a new floor document record
  static async create(documentData) {
    const {
      company_id,
      apartment_id,
      floor_id,
      file_name,
      original_name,
      file_path,
      file_size,
      mime_type,
      uploaded_by
    } = documentData;

    const query = `
      INSERT INTO floor_documents 
      (company_id, apartment_id, floor_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      company_id,
      apartment_id,
      floor_id,
      file_name,
      original_name,
      file_path,
      file_size,
      mime_type,
      uploaded_by
    ]);

    return this.findById(result.insertId);
  }

  // Find document by ID
  static async findById(id) {
    const query = `
      SELECT * FROM floor_documents WHERE id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Find all documents for a floor
  static async findByFloorId(floorId) {
    const query = `
      SELECT 
        id,
        company_id,
        apartment_id,
        floor_id,
        file_name,
        original_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by,
        created_at
      FROM floor_documents 
      WHERE floor_id = ? 
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [floorId]);
    return rows;
  }

  // Delete document by ID
  static async delete(id) {
    const query = `DELETE FROM floor_documents WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Check if document belongs to user's company
  static async belongsToCompany(documentId, companyId) {
    const query = `SELECT id FROM floor_documents WHERE id = ? AND company_id = ?`;
    const [rows] = await pool.execute(query, [documentId, companyId]);
    return rows.length > 0;
  }

  // Get document with floor details
  static async getDocumentWithDetails(documentId) {
    const query = `
      SELECT 
        fd.*,
        f.floor_id as floor_number,
        a.name as apartment_name,
        u.firstname as uploaded_by_name
      FROM floor_documents fd
      LEFT JOIN floors f ON fd.floor_id = f.id
      LEFT JOIN apartments a ON fd.apartment_id = a.id
      LEFT JOIN users u ON fd.uploaded_by = u.id
      WHERE fd.id = ?
    `;
    const [rows] = await pool.execute(query, [documentId]);
    return rows[0] || null;
  }
}

module.exports = FloorDocument;