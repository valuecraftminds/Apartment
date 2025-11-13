const pool = require('../db');

class ApartmentDocument {
  // Create a new document record
  static async create(documentData) {
    const {
      company_id,
      apartment_id,
      file_name,
      original_name,
      file_path,
      file_size,
      mime_type,
      uploaded_by
    } = documentData;

    const query = `
      INSERT INTO apartment_documents 
      (company_id, apartment_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      company_id,
      apartment_id,
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
      SELECT * FROM apartment_documents WHERE id = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  }

  // Find all documents for an apartment
  static async findByApartmentId(apartmentId) {
    const query = `
      SELECT 
        id,
        company_id,
        apartment_id,
        file_name,
        original_name,
        file_path,
        file_size,
        mime_type,
        uploaded_by,
        created_at
      FROM apartment_documents 
      WHERE apartment_id = ? 
      ORDER BY created_at DESC
    `;
    const [rows] = await pool.execute(query, [apartmentId]);
    return rows;
  }

  // Delete document by ID
  static async delete(id) {
    const query = `DELETE FROM apartment_documents WHERE id = ?`;
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Check if document belongs to user's company
  static async belongsToCompany(documentId, companyId) {
    const query = `SELECT id FROM apartment_documents WHERE id = ? AND company_id = ?`;
    const [rows] = await pool.execute(query, [documentId, companyId]);
    return rows.length > 0;
  }

  // Get document with apartment details
  static async getDocumentWithDetails(documentId) {
    const query = `
      SELECT 
        ad.*,
        a.name as apartment_name,
        u.name as uploaded_by_name
      FROM apartment_documents ad
      LEFT JOIN apartments a ON ad.apartment_id = a.id
      LEFT JOIN users u ON ad.uploaded_by = u.id
      WHERE ad.id = ?
    `;
    const [rows] = await pool.execute(query, [documentId]);
    return rows[0] || null;
  }
}

module.exports = ApartmentDocument;