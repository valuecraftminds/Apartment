// models/Complaint.js 
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Complaint {
    // Generate complaint number
    static generateComplaintNumber() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `COMP${timestamp}${random}`;
    }

    // Create new complaint (updated with category)
    static async create(complaintData) {
        const {
            company_id,
            apartment_id,
            floor_id,
            house_id,
            houseowner_id,
            title,
            description,
            category = 'General',
            priority = 'Medium'
        } = complaintData;

        const id = uuidv4();
        const complaint_number = this.generateComplaintNumber();

        const [result] = await pool.execute(
            `INSERT INTO complaints 
            (id, company_id, apartment_id, floor_id, house_id, houseowner_id, 
             complaint_number, title, description, category, priority) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, company_id, apartment_id, floor_id, house_id, houseowner_id,
                complaint_number, title, description, category, priority
            ]
        );

        return { id, complaint_number, ...complaintData };
    }

    // Find complaint by ID (updated with technician info)
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT c.*, 
                    a.name as apartment_name,
                    f.floor_id as floor_number,
                    h.house_id as house_number,
                    ho.name as houseowner_name,
                    ho.email as houseowner_email,
                    ho.mobile as houseowner_mobile,
                    CONCAT(u.firstname, ' ', u.lastname) as assigned_to_name,
                    u.mobile as assigned_to_mobile,
                    u.email as assigned_to_email,
                    r.role_name as assigned_to_role,
                    CONCAT(au.firstname, ' ', au.lastname) as assigned_by_name
             FROM complaints c
             LEFT JOIN apartments a ON c.apartment_id = a.id
             LEFT JOIN floors f ON c.floor_id = f.id
             LEFT JOIN houses h ON c.house_id = h.id
             LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
             LEFT JOIN users u ON c.assigned_to = u.id
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN users au ON c.assigned_by = au.id
             WHERE c.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Find complaints by company (updated with technician info)
    static async findByCompany(company_id, filters = {}) {
        let query = `
            SELECT c.*, 
                   a.name as apartment_name,
                   f.floor_id as floor_number,
                   h.house_id as house_number,
                   ho.name as houseowner_name,
                   ho.mobile as houseowner_mobile,
                   CONCAT(u.firstname, ' ', u.lastname) as assigned_to_name,
                   r.role_name as assigned_to_role
            FROM complaints c
            LEFT JOIN apartments a ON c.apartment_id = a.id
            LEFT JOIN floors f ON c.floor_id = f.id
            LEFT JOIN houses h ON c.house_id = h.id
            LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
            LEFT JOIN users u ON c.assigned_to = u.id
            LEFT JOIN roles r ON u.role_id = r.id
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
        
        if (filters.category && filters.category !== 'all') {
            query += ' AND c.category = ?';
            params.push(filters.category);
        }
        
        if (filters.assigned === 'assigned') {
            query += ' AND c.assigned_to IS NOT NULL';
        } else if (filters.assigned === 'unassigned') {
            query += ' AND c.assigned_to IS NULL';
        }
        
        query += ' ORDER BY c.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

// static async getTechniciansByCategory(company_id) {
//     const query = `
//         SELECT 
//             u.id,
//             u.firstname,
//             u.lastname,
//             u.email,
//             u.mobile,
//             r.role_name,
//             CONCAT(u.firstname, ' ', u.lastname) as name
//         FROM users u
//         LEFT JOIN roles r ON u.role_id = r.id
//         WHERE u.company_id = ? 
//         AND r.role_name IN ('Technician', 'Maintenance Staff', 'Maintenance', 'technician', 'Apartment Technician', 'Apartment_Technician')
//         AND u.is_active = 1
//         ORDER BY u.firstname, u.lastname ASC
//     `;
    
//     const [rows] = await pool.execute(query, [company_id]);
//     return rows;
// }

static async getTechniciansByCategory(company_id, category = null) {
    let query = `
        SELECT 
            u.id,
            u.firstname,
            u.lastname,
            u.email,
            u.mobile,
            r.role_name,
            CONCAT(u.firstname, ' ', u.lastname) as name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.company_id = ? 
        AND r.role_name IN ('Technician', 'Maintenance Staff', 'Maintenance', 'technician', 'Apartment Technician', 'Apartment_Technician')
        AND u.is_active = 1
    `;
    
    const params = [company_id];
    
    // Optional: Add category filtering if needed
    // if (category) {
    //     query += ' AND u.specialization LIKE ?';
    //     params.push(`%${category}%`);
    // }
    
    query += ' ORDER BY u.firstname, u.lastname ASC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
}

    // Get complaint categories
    static async getCategories(company_id) {
        const [rows] = await pool.execute(
            `SELECT DISTINCT category 
             FROM complaints 
             WHERE company_id = ? 
             AND category IS NOT NULL 
             AND category != ''
             ORDER BY category ASC`,
            [company_id]
        );
        return rows.map(row => row.category);
    }

    // Assign technician to complaint
    // static async assignTechnician(complaintId, assignmentData) {
    //     const {
    //         technician_id,
    //         assigned_by,
    //         assignment_note
    //     } = assignmentData;

    //     const [result] = await pool.execute(
    //         `UPDATE complaints 
    //          SET assigned_to = ?,
    //              assigned_by = ?,
    //              assigned_at = CURRENT_TIMESTAMP,
    //              assignment_note = ?,
    //              status = 'In Progress',
    //              updated_at = CURRENT_TIMESTAMP
    //          WHERE id = ?`,
    //         [technician_id, assigned_by, assignment_note, complaintId]
    //     );

    //     return result.affectedRows > 0;
    // }
    
    static async assignTechnician(complaintId, assignmentData) {
        const {
            technician_id,
            assigned_by,
            assignment_note,
            category // Add this parameter
        } = assignmentData;

        // Build the update query dynamically
        const updates = [
            'assigned_to = ?',
            'assigned_by = ?',
            'assigned_at = CURRENT_TIMESTAMP',
            'assignment_note = ?', 
            'status = "In Progress"',
            'updated_at = CURRENT_TIMESTAMP'
        ];
        
        const params = [technician_id, assigned_by, assignment_note];
        
        // Add category update if provided
        if (category) {
            updates.push('category = ?');
            params.push(category);
        }
        
        params.push(complaintId);
        
        const [result] = await pool.execute(
            `UPDATE complaints 
            SET ${updates.join(', ')}
            WHERE id = ?`,
            params
        );

        return result.affectedRows > 0;
    }

    // Update complaint (extended with category and priority)
    static async update(id, updateData) {
        const {
            title,
            description,
            status,
            category,
            priority
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
        
        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }
        
        if (priority !== undefined) {
            updates.push('priority = ?');
            params.push(priority);
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(id);
        
        await pool.execute(query, params);
        return this.findById(id);
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

    // Delete complaint (soft delete - just change status)
    static async softDelete(id) {
        await pool.execute(
            'UPDATE complaints SET status = "Closed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return true;
    }

    // Add this method to your Complaint class
    static async findByTechnician(technician_id, filters = {}) {
        let query = `
            SELECT c.*, 
                a.name as apartment_name,
                f.floor_id as floor_number,
                h.house_id as house_number,
                ho.name as houseowner_name,
                ho.mobile as houseowner_mobile,
                ho.email as houseowner_email,
                CONCAT(u.firstname, ' ', u.lastname) as assigned_by_name
            FROM complaints c
            LEFT JOIN apartments a ON c.apartment_id = a.id
            LEFT JOIN floors f ON c.floor_id = f.id
            LEFT JOIN houses h ON c.house_id = h.id
            LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
            LEFT JOIN users u ON c.assigned_by = u.id
            WHERE c.assigned_to = ?
        `;
        
        const params = [technician_id];
        
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

    // Get technician's complaint statistics
    static async getTechnicianStatistics(technician_id) {
        const [rows] = await pool.execute(
            `SELECT 
                status,
                COUNT(*) as count
            FROM complaints 
            WHERE assigned_to = ?
            GROUP BY status`,
            [technician_id]
        );
        
        const total = rows.reduce((sum, row) => sum + row.count, 0);
        const pending = rows.find(row => row.status === 'Pending')?.count || 0;
        const in_progress = rows.find(row => row.status === 'In Progress')?.count || 0;
        const resolved = rows.find(row => row.status === 'Resolved' || row.status === 'Closed')?.count || 0;
        
        return {
            total,
            pending,
            in_progress,
            resolved,
            by_status: rows
        };
    }

    // models/Complaint.js - Add these methods

// Start timer for complaint
static async startTimer(complaintId, technicianId) {
    const [result] = await pool.execute(
        `UPDATE complaints 
         SET work_started_at = CURRENT_TIMESTAMP,
             work_paused_at = NULL,
             is_timer_running = TRUE,
             last_timer_action = 'start',
             status = 'In Progress',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND assigned_to = ? AND is_timer_running = FALSE`,
        [complaintId, technicianId]
    );
    
    return result.affectedRows > 0;
}

// Pause timer for complaint
static async pauseTimer(complaintId, technicianId) {
    // First get current work time
    const [current] = await pool.execute(
        `SELECT work_started_at, total_work_time 
         FROM complaints 
         WHERE id = ? AND assigned_to = ? AND is_timer_running = TRUE`,
        [complaintId, technicianId]
    );
    
    if (current.length === 0) return false;
    
    const complaint = current[0];
    let additionalTime = 0;
    
    // Calculate time elapsed since work started
    if (complaint.work_started_at) {
        const startTime = new Date(complaint.work_started_at);
        const now = new Date();
        additionalTime = Math.floor((now - startTime) / 1000); // Convert to seconds
    }
    
    const [result] = await pool.execute(
        `UPDATE complaints 
         SET work_paused_at = CURRENT_TIMESTAMP,
             is_timer_running = FALSE,
             total_work_time = total_work_time + ?,
             last_timer_action = 'pause',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND assigned_to = ?`,
        [additionalTime, complaintId, technicianId]
    );
    
    return result.affectedRows > 0;
}

// Stop/Complete timer for complaint
static async stopTimer(complaintId, technicianId) {
    // First get current work time and started time
    const [current] = await pool.execute(
        `SELECT work_started_at, total_work_time 
         FROM complaints 
         WHERE id = ? AND assigned_to = ?`,
        [complaintId, technicianId]
    );
    
    if (current.length === 0) return false;
    
    const complaint = current[0];
    let additionalTime = 0;
    
    // Calculate time elapsed if timer was running
    if (complaint.work_started_at && !complaint.work_paused_at) {
        const startTime = new Date(complaint.work_started_at);
        const now = new Date();
        additionalTime = Math.floor((now - startTime) / 1000);
    }
    
    const [result] = await pool.execute(
        `UPDATE complaints 
         SET work_paused_at = NULL,
             work_started_at = NULL,
             is_timer_running = FALSE,
             total_work_time = total_work_time + ?,
             last_timer_action = 'stop',
             status = 'Resolved',
             resolved_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND assigned_to = ?`,
        [additionalTime, complaintId, technicianId]
    );
    
    return result.affectedRows > 0;
}

// Resume timer for complaint
static async resumeTimer(complaintId, technicianId) {
    const [result] = await pool.execute(
        `UPDATE complaints 
         SET work_started_at = CURRENT_TIMESTAMP,
             work_paused_at = NULL,
             is_timer_running = TRUE,
             last_timer_action = 'start',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND assigned_to = ? AND is_timer_running = FALSE`,
        [complaintId, technicianId]
    );
    
    return result.affectedRows > 0;
}

// Get timer status for a complaint
static async getTimerStatus(complaintId) {
    const [rows] = await pool.execute(
        `SELECT 
            work_started_at,
            work_paused_at,
            total_work_time,
            is_timer_running,
            last_timer_action
         FROM complaints 
         WHERE id = ?`,
        [complaintId]
    );
    
    if (rows.length === 0) return null;
    
    const complaint = rows[0];
    
    // Calculate current elapsed time if timer is running
    let currentElapsed = complaint.total_work_time;
    if (complaint.is_timer_running && complaint.work_started_at) {
        const startTime = new Date(complaint.work_started_at);
        const now = new Date();
        currentElapsed += Math.floor((now - startTime) / 1000);
    }
    
    return {
        ...complaint,
        currentElapsedTime: currentElapsed,
        formattedTime: Complaint.formatTime(currentElapsed)
    };
}

// Helper function to format time
static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
}

module.exports = Complaint;