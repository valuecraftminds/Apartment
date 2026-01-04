const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Complaint {
    // Generate complaint number
    static generateComplaintNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `COMP${timestamp}${random}`;
    }

    // Create new complaint
    static async create(complaintData) {
        const {
            company_id,
            apartment_id,
            floor_id,
            house_id,
            houseowner_id,
            title,
            description,
        } = complaintData;

        const id = uuidv4();
        const complaint_number = this.generateComplaintNumber();

        const [result] = await pool.execute(
            `INSERT INTO complaints 
            (id, company_id, apartment_id, floor_id, house_id, houseowner_id, 
             complaint_number, title, description) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, company_id, apartment_id, floor_id, house_id, houseowner_id,
                complaint_number, title, description
            ]
        );

        return { id, complaint_number, ...complaintData };
    }

    // Find complaint by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT c.*, 
                    a.name as apartment_name,
                    f.floor_id as floor_number,
                    h.house_id as house_number,
                    ho.name as houseowner_name,
                    ho.email as houseowner_email,
                    ho.mobile as houseowner_mobile
             FROM complaints c
             LEFT JOIN apartments a ON c.apartment_id = a.id
             LEFT JOIN floors f ON c.floor_id = f.id
             LEFT JOIN houses h ON c.house_id = h.id
             LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Find complaints by houseowner
    static async findByHouseOwner(houseowner_id, filters = {}) {
        let query = `
            SELECT c.*, 
                   a.name as apartment_name,
                   f.floor_id as floor_number,
                   h.house_id as house_number
            FROM complaints c
            LEFT JOIN apartments a ON c.apartment_id = a.id
            LEFT JOIN floors f ON c.floor_id = f.id
            LEFT JOIN houses h ON c.house_id = h.id
            WHERE c.houseowner_id = ?
        `;
        
        const params = [houseowner_id];
        
        // Apply filters
        if (filters.status && filters.status !== 'all') {
            query += ' AND c.status = ?';
            params.push(filters.status);
        }
        
        if (filters.start_date) {
            query += ' AND DATE(c.created_at) >= ?';
            params.push(filters.start_date);
        }
        
        if (filters.end_date) {
            query += ' AND DATE(c.created_at) <= ?';
            params.push(filters.end_date);
        }
        
        query += ' ORDER BY c.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Find complaints by company (for admin/staff)
    static async findByCompany(company_id, filters = {}) {
        let query = `
            SELECT c.*, 
                   a.name as apartment_name,
                   f.floor_id as floor_number,
                   h.house_id as house_number,
                   ho.name as houseowner_name,
                   ho.mobile as houseowner_mobile
            FROM complaints c
            LEFT JOIN apartments a ON c.apartment_id = a.id
            LEFT JOIN floors f ON c.floor_id = f.id
            LEFT JOIN houses h ON c.house_id = h.id
            LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
            WHERE c.company_id = ?
        `;
        
        const params = [company_id];
        
        // Apply filters
        if (filters.status && filters.status !== 'all') {
            query += ' AND c.status = ?';
            params.push(filters.status);
        }
        
        if (filters.apartment_id && filters.apartment_id !== 'all') {
            query += ' AND c.apartment_id = ?';
            params.push(filters.apartment_id);
        }
        
        query += ' ORDER BY c.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Update complaint
    static async update(id, updateData) {
        const {
            title,
            description,
            status,
        } = updateData;
        
        let query = 'UPDATE complaints SET ';
        const params = [];
        const updates = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        
        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
            
            // Auto-set resolved_at if status is Resolved or Closed
            if (status === 'Resolved' || status === 'Closed') {
                updates.push('resolved_at = CURRENT_TIMESTAMP');
            } else if (status === 'Pending' || status === 'In Progress') {
                updates.push('resolved_at = NULL');
            }
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);
        
        await pool.execute(query, params);
        return this.findById(id);
    }

    // Delete complaint (soft delete - just change status)
    static async softDelete(id) {
        await pool.execute(
            'UPDATE complaints SET status = "Closed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return true;
    }

    // Get complaint statistics for houseowner
    static async getHouseOwnerStatistics(houseowner_id) {
        const [rows] = await pool.execute(
            `SELECT 
                status,
                COUNT(*) as count
             FROM complaints 
             WHERE houseowner_id = ?
             GROUP BY status`,
            [houseowner_id]
        );
        
        const total = rows.reduce((sum, row) => sum + row.count, 0);
        const pending = rows.find(row => row.status === 'Pending')?.count || 0;
        const resolved = rows.find(row => row.status === 'Resolved' || row.status === 'Closed')?.count || 0;
        
        return {
            total,
            pending,
            resolved,
            by_status: rows
        };
    }

    // Get complaint statistics for company
    static async getCompanyStatistics(company_id) {
        const [rows] = await pool.execute(
            `SELECT 
                status,
                COUNT(*) as count
             FROM complaints 
             WHERE company_id = ?
             GROUP BY status`,
            [company_id]
        );
        
        return {
            by_status: rows
        };
    }

    // Get recent complaints for dashboard
    static async getRecentComplaints(houseowner_id, limit = 5) {
        const [rows] = await pool.execute(
            `SELECT id, complaint_number, title, status, created_at
             FROM complaints 
             WHERE houseowner_id = ?
             ORDER BY created_at DESC
             LIMIT ?`,
            [houseowner_id, limit]
        );
        return rows;
    }
}

module.exports = Complaint;