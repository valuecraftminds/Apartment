// models/HouseDocument.js
const pool = require('../db');
const path = require('path');
const fs = require('fs').promises;

class HouseDocument {
    static async create(documentData) {
        const {
            company_id,
            apartment_id,
            floor_id,
            house_id,
            file_name,
            original_name,
            file_path,
            file_size,
            mime_type,
            uploaded_by
        } = documentData;

        const query = `INSERT INTO house_documents 
            (company_id, apartment_id, floor_id, house_id, file_name, original_name, file_path, file_size, mime_type, uploaded_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await pool.execute(query, [
            company_id, 
            apartment_id, 
            floor_id, 
            house_id, 
            file_name, 
            original_name, 
            file_path, 
            file_size, 
            mime_type, 
            uploaded_by
        ]);

        return this.findById(result.insertId);
    }

    static async findById(id) {
    const query = `
      SELECT * FROM house_documents WHERE id = ?
    `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    }

    static async findByHouseId(houseId) {
        const [rows] = await pool.execute(
            `SELECT * FROM house_documents WHERE house_id = ? ORDER BY created_at DESC`,
            [houseId]
        );
        return rows;
    }

    static async delete(id) {
        const query = 
            `DELETE FROM house_documents WHERE id = ?`;
        const [result] = await pool.execute(query,[id])
        return result.affectedRows > 0;
    }

    // 🔥 ADD THESE MISSING METHODS (from floor documents)
    static async belongsToCompany(documentId, companyId) {
        const [rows] = await pool.execute(
            `SELECT id FROM house_documents WHERE id = ? AND company_id = ?`,
            [documentId, companyId]
        );
        return rows.length > 0;
    }

    static async getDocumentWithDetails(documentId) {
        const query = 
            `SELECT 
                hd.*,
                h.house_id as house_number,
                f.floor_id as floor_number,
                a.name as apartment_name,
                u.firstname as uploaded_by_name
            FROM house_documents hd
            LEFT JOIN houses h ON hd.house_id = h.id
            LEFT JOIN floors f ON hd.floor_id = f.id
            LEFT JOIN apartments a ON hd.apartment_id = a.id
            LEFT JOIN users u ON hd.uploaded_by = u.id
            WHERE hd.id = ?`;

        const [rows] = await pool.execute(query,[documentId]);    
        return rows[0] || null;
    }
}

module.exports = HouseDocument;