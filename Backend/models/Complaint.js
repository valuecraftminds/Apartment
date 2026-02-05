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
            category_id = null,  
            priority = 'Medium'
        } = complaintData;

        const id = uuidv4();
        const complaint_number = this.generateComplaintNumber();

        // Updated query to match the new table structure
        const [result] = await pool.execute(
            `INSERT INTO complaints 
            (id, company_id, apartment_id, floor_id, house_id, houseowner_id,
            complaint_number, title, description, category_id, priority) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, company_id, apartment_id, floor_id, house_id, houseowner_id,
                complaint_number, title, description, category_id, priority
            ]
        );

        return { id, complaint_number, ...complaintData };
    }

    static async getComplaintCategories(company_id) {
        const [rows] = await pool.execute(
            `SELECT id, name, description, icon, color 
            FROM complaint_categories 
            WHERE company_id = ? 
            AND is_active = 1
            ORDER BY name ASC`,
            [company_id]
        );
        return rows;
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
                    cc.name as category_name,  -- Add this
                    cc.icon as category_icon,  -- Add this
                    cc.color as category_color -- Add this
                    FROM complaints c
                    LEFT JOIN apartments a ON c.apartment_id = a.id
                    LEFT JOIN floors f ON c.floor_id = f.id
                    LEFT JOIN houses h ON c.house_id = h.id
                    LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
                    LEFT JOIN complaint_categories cc ON c.category_id = cc.id  -- Add this join
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
                cc.name as category_name
                FROM complaints c
                LEFT JOIN apartments a ON c.apartment_id = a.id
                LEFT JOIN floors f ON c.floor_id = f.id
                LEFT JOIN houses h ON c.house_id = h.id
                LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
                LEFT JOIN complaint_categories cc ON c.category_id = cc.id  
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
        
        if (filters.category_id && filters.category_id !== 'all') {
            query += ' AND c.category_id = ?';  // Fix: use category_id, not category
            params.push(filters.category_id);
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
            `SELECT DISTINCT cc.name as category_name, cc.id as category_id
            FROM complaints c
            LEFT JOIN complaint_categories cc ON c.category_id = cc.id
            WHERE c.company_id = ? 
            AND c.category_id IS NOT NULL 
            ORDER BY cc.name ASC`,
            [company_id]
        );
        return rows;
    }

    // Update complaint (extended with category and priority)
    static async update(id, updateData) {
        const {
            title,
            description,
            status,
            category_id,  // This should be category_id if you're updating category
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
            updates.push('category_id = ?');  // Change from 'category' to 'category_id'
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
            CONCAT(u.firstname, ' ', u.lastname) as assigned_by_name,
            cc.name as category_name,           
            cc.id as category_id,               
            cc.icon as category_icon,           
            cc.color as category_color          
            FROM complaints c
            LEFT JOIN apartments a ON c.apartment_id = a.id
            LEFT JOIN floors f ON c.floor_id = f.id
            LEFT JOIN houses h ON c.house_id = h.id
            LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
            LEFT JOIN users u ON c.assigned_by = u.id
            LEFT JOIN complaint_categories cc ON c.category_id = cc.id            
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

    // Start timer for complaint
    static async startTimer(complaintId, technicianId) {
        try {
            // First check if technician can access this complaint
            const accessCheck = await Complaint.canTechnicianStartWork(complaintId, technicianId, null);
            
            if (!accessCheck.canStart) {
                throw new Error(accessCheck.reason || 'You do not have access to this complaint');
            }
            
            // Check if complaint exists and timer isn't already running
            const [check] = await pool.execute(
                `SELECT id, status, is_timer_running FROM complaints WHERE id = ?`,
                [complaintId]
            );
            
            if (check.length === 0) {
                throw new Error('Complaint not found');
            }
            
            const complaint = check[0];
            
            // Check if timer is already running
            if (complaint.is_timer_running) {
                throw new Error('Timer is already running');
            }
            
            // FIXED: Correct parameter order
            const [result] = await pool.execute(
                `UPDATE complaints 
                SET work_started_at = CURRENT_TIMESTAMP,
                    work_paused_at = NULL,
                    is_timer_running = TRUE,
                    last_timer_action = 'start',
                    status = 'In Progress',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND is_timer_running = FALSE`,
                [complaintId]  // FIXED: Only complaintId
            );
            
            return result.affectedRows > 0;
            
        } catch (error) {
            console.error('Error in startTimer:', error);
            throw error;
        }
    }

    static async pauseTimer(complaintId, technicianId) {
        try{
            // Check access first
            const accessCheck = await Complaint.canTechnicianStartWork(complaintId, technicianId, null);
            if (!accessCheck.canStart) {
                throw new Error(accessCheck.reason);
            }

            const [current] = await pool.execute(
            `SELECT work_started_at, total_work_time 
            FROM complaints 
            WHERE id = ? AND is_timer_running = TRUE`,  // Removed assigned_to check
            [complaintId]
        );
        
        if (current.length === 0) return false;
        
        const complaint = current[0];
        let additionalTime = 0;
        
        // Calculate time elapsed since work started
        if (complaint.work_started_at) {
            const startTime = new Date(complaint.work_started_at);
            const now = new Date();
            additionalTime = Math.floor((now - startTime) / 1000);
        }
        
        const [result] = await pool.execute(
            `UPDATE complaints 
            SET work_paused_at = CURRENT_TIMESTAMP,
                is_timer_running = FALSE,
                total_work_time = total_work_time + ?,
                last_timer_action = 'pause',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,  // Removed assigned_to check
            [additionalTime, complaintId]
        );
        
        return result.affectedRows > 0;

        }catch (error) {
            console.error('Error in pauseTimer:', error);
            throw error;
        }
    }


    // Stop/Complete timer for complaint
    // static async stopTimer(complaintId, technicianId) {
    //     try {
    //         // Check access first
    //         const accessCheck = await Complaint.canTechnicianStartWork(complaintId, technicianId, null);
    //         if (!accessCheck.canStart) {
    //             throw new Error(accessCheck.reason);
    //         }

    //         // Check if complaint is on hold
    //         const [check] = await pool.execute(
    //             `SELECT is_on_hold FROM complaints WHERE id = ?`,
    //             [complaintId]
    //         );
            
    //         if (check.length === 0) return false;
            
    //         complaint = check[0];
            
    //         if (complaint.is_on_hold) {
    //             throw new Error('Cannot complete complaint while it is on hold. Please resume the complaint first.');
    //         }
            
    //         // Get current work time and started time
    //         const [current] = await pool.execute(
    //             `SELECT work_started_at, total_work_time, is_timer_running
    //             FROM complaints WHERE id = ?`,
    //             [complaintId]
    //         );
            
    //         if (current.length === 0) return false;
            
    //         const complaint = current[0];
    //         let additionalTime = 0;
            
    //         // Calculate time elapsed if timer was running
    //         if (complaint.work_started_at && complaint.is_timer_running) {
    //             const startTime = new Date(complaint.work_started_at);
    //             const now = new Date();
    //             additionalTime = Math.floor((now - startTime) / 1000);
    //         }
            
    //         const [result] = await pool.execute(
    //             `UPDATE complaints 
    //             SET work_paused_at = NULL,
    //                 work_started_at = NULL,
    //                 is_timer_running = FALSE,
    //                 total_work_time = total_work_time + ?,
    //                 last_timer_action = 'stop',
    //                 status = 'Resolved',  
    //                 resolved_at = CURRENT_TIMESTAMP,
    //                 updated_at = CURRENT_TIMESTAMP
    //             WHERE id = ?`,
    //             [additionalTime, complaintId]
    //         );
            
    //         return result.affectedRows > 0;
    //     } catch (error) {
    //         console.error('Error in stopTimer:', error);
    //         throw error;
    //     }
    // }
    
    static async stopTimer(complaintId, technicianId) {
        try {
            // Check access first
            const accessCheck = await Complaint.canTechnicianStartWork(complaintId, technicianId, null);
            if (!accessCheck.canStart) {
                throw new Error(accessCheck.reason);
            }

            // Get current complaint state
            const [current] = await pool.execute(
                `SELECT work_started_at, total_work_time, is_timer_running, is_on_hold
                FROM complaints WHERE id = ?`,
                [complaintId]
            );
            
            if (current.length === 0) {
                throw new Error('Complaint not found');
            }
            
            const complaint = current[0];
            
            // Check if complaint is on hold
            if (complaint.is_on_hold) {
                throw new Error('Cannot complete complaint while it is on hold. Please resume the complaint first.');
            }
            
            let additionalTime = 0;
            
            // Calculate time elapsed if timer was running
            if (complaint.work_started_at && complaint.is_timer_running) {
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
                WHERE id = ?`,
                [additionalTime, complaintId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in stopTimer:', error);
            throw error;
        }
    }

    // static async resumeTimer(complaintId, technicianId) {
    //     const [result] = await pool.execute(
    //         `UPDATE complaints 
    //         SET work_started_at = CURRENT_TIMESTAMP,
    //             work_paused_at = NULL,
    //             is_timer_running = TRUE,
    //             last_timer_action = 'start',
    //             updated_at = CURRENT_TIMESTAMP
    //         WHERE id = ? AND is_timer_running = FALSE`,  // Removed assigned_to check
    //         [complaintId]
    //     );
        
    //     return result.affectedRows > 0;
    // }
    static async resumeTimer(complaintId, technicianId) {
        try {
            // Check if the complaint is on hold first
            const [check] = await pool.execute(
                `SELECT id, status, is_on_hold, is_timer_running 
                FROM complaints WHERE id = ?`,
                [complaintId]
            );
            
            if (check.length === 0) {
                throw new Error('Complaint not found');
            }
            
            const complaint = check[0];
            
            // If complaint is on hold, use resumeComplaint instead
            if (complaint.is_on_hold) {
                throw new Error('Complaint is on hold. Use resumeComplaint method instead.');
            }
            
            // Only resume if timer is not already running
            if (complaint.is_timer_running) {
                throw new Error('Timer is already running');
            }
            
            const [result] = await pool.execute(
                `UPDATE complaints 
                SET work_started_at = CURRENT_TIMESTAMP,
                    work_paused_at = NULL,
                    is_timer_running = TRUE,
                    last_timer_action = 'resume',
                    status = 'In Progress',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND is_timer_running = FALSE`,
                [complaintId]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error in resumeTimer:', error);
            throw error;
        }
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


    static async findByTechnicianWithFilters(company_id, assignedApartmentIds, assignedCategoryIds, filters = {}) {
    if (assignedApartmentIds.length === 0) {
        return [];
    }
    
    let query = `
        SELECT c.*, 
        a.name as apartment_name,
        f.floor_id as floor_number,
        h.house_id as house_number,
        ho.name as houseowner_name,
        ho.mobile as houseowner_mobile,
        ho.email as houseowner_email,
        cc.name as category_name,           
        cc.id as category_id,               
        cc.icon as category_icon,           
        cc.color as category_color          
        FROM complaints c
        LEFT JOIN apartments a ON c.apartment_id = a.id
        LEFT JOIN floors f ON c.floor_id = f.id
        LEFT JOIN houses h ON c.house_id = h.id
        LEFT JOIN houseowner ho ON c.houseowner_id = ho.id
        LEFT JOIN complaint_categories cc ON c.category_id = cc.id            
        WHERE c.company_id = ?
        AND c.apartment_id IN (${assignedApartmentIds.map(() => '?').join(', ')})
        AND c.status IN ('Pending', 'In Progress', 'Resolved') 
    `;
    
    const params = [company_id, ...assignedApartmentIds];
    
    // Add category filter if there are assigned categories
    if (assignedCategoryIds.length > 0) {
        // Show complaints that match assigned categories OR have no category (if needed)
        query += ` AND (c.category_id IS NULL OR c.category_id IN (${assignedCategoryIds.map(() => '?').join(', ')}))`;
        params.push(...assignedCategoryIds);
    }
    
    // Apply other filters
    if (filters.status && filters.status !== 'all') {
        query += ' AND c.status = ?';
        params.push(filters.status);
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
}

    static async canTechnicianStartWork(complaintId, technicianId, companyId) {
        try {
            const [rows] = await pool.execute(
                `SELECT c.*, 
                        ua.apartment_id as assigned_apartment_id,
                        tc.category_id as assigned_category_id
                FROM complaints c
                LEFT JOIN user_apartments ua ON c.apartment_id = ua.apartment_id AND ua.user_id = ?
                LEFT JOIN technician_categories tc ON c.category_id = tc.category_id AND tc.technician_id = ?
                WHERE c.id = ? AND c.status IN ('Pending', 'In Progress')`,
                [technicianId, technicianId, complaintId]
            );
            
            if (rows.length === 0) {
                return { canStart: false, reason: 'Complaint not found or not active' };
            }
            
            const complaint = rows[0];
            
            // Check if technician is assigned to this apartment
            if (!complaint.assigned_apartment_id) {
                return { canStart: false, reason: 'You are not assigned to this apartment' };
            }
            
            // Check if technician is assigned to this category (if category exists)
            if (complaint.category_id && !complaint.assigned_category_id) {
                return { canStart: false, reason: 'You are not assigned to this complaint category' };
            }
            
            // Verify company matches if provided
            if (companyId && complaint.company_id !== companyId) {
                return { canStart: false, reason: 'Complaint does not belong to your company' };
            }
            
            return { canStart: true, complaint: complaint };
        } catch (error) {
            console.error('Error in canTechnicianStartWork:', error);
            return { canStart: false, reason: 'Error checking access' };
        }
    }

    // Hold a complaint
    static async holdComplaint(complaintId, technicianId, reason, expectedResolutionDate = null) {
        const connection = await pool.getConnection();
        
        try {
            const accessCheck = await Complaint.canTechnicianStartWork(complaintId, technicianId, null);
            if (!accessCheck.canStart) {
                throw new Error(accessCheck.reason);
            }
            
            // Check if complaint is in progress
            const [check] = await connection.execute(
                `SELECT id, status, is_on_hold, company_id FROM complaints WHERE id = ?`,
                [complaintId]
            );
            
            if (check.length === 0) {
                throw new Error('Complaint not found');
            }
            
            const complaint = check[0];
            
            if (complaint.is_on_hold) {
                throw new Error('Complaint is already on hold');
            }
            
            if (complaint.status !== 'In Progress') {
                throw new Error('Only complaints in progress can be put on hold');
            }
            
            // Start transaction using regular query
            await connection.beginTransaction();
            
            try {
                // Create hold reason record
                const holdId = uuidv4();
                const companyId = complaint.company_id;
                
                await connection.execute(
                    `INSERT INTO complaint_hold_reasons 
                    (id, company_id, complaint_id, technician_id, reason, expected_resolution_date, held_at) 
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                    [holdId, companyId, complaintId, technicianId, reason, expectedResolutionDate]
                );
                
                // Update complaint status
                await connection.execute(
                    `UPDATE complaints 
                    SET is_on_hold = TRUE,
                        hold_reason_id = ?,
                        status = 'In Progress', 
                        updated_at = CURRENT_TIMESTAMP,
                        work_paused_at = CURRENT_TIMESTAMP,
                        is_timer_running = FALSE,
                        last_timer_action = 'pause'
                    WHERE id = ?`,
                    [holdId, complaintId]
                );
                
                await connection.commit();
                
                return {
                    success: true,
                    holdId: holdId,
                    message: 'Complaint placed on hold successfully'
                };
                
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
            
        } catch (error) {
            console.error('Error in holdComplaint:', error);
            // Make sure to release connection even on error
            if (connection && connection.release) {
                connection.release();
            }
            throw error;
        }
    }

    // Resume a complaint from hold
    static async resumeComplaint(complaintId, technicianId) {
        const connection = await pool.getConnection();
        
        try {
            const accessCheck = await Complaint.canTechnicianStartWork(complaintId, technicianId, null);
            if (!accessCheck.canStart) {
                throw new Error(accessCheck.reason);
            }
            
            // Check if complaint is on hold
            const [check] = await connection.execute(
                `SELECT c.id, c.status, c.is_on_hold, chr.id as hold_reason_id
                FROM complaints c
                LEFT JOIN complaint_hold_reasons chr ON c.hold_reason_id = chr.id
                WHERE c.id = ?`,
                [complaintId]
            );
            
            if (check.length === 0) {
                throw new Error('Complaint not found');
            }
            
            const complaint = check[0];
            
            if (!complaint.is_on_hold) {
                throw new Error('Complaint is not on hold');
            }
            
            // Start transaction
            await connection.beginTransaction();
            
            try {
                // Update hold reason record
                await connection.execute(
                    `UPDATE complaint_hold_reasons 
                    SET resumed_at = CURRENT_TIMESTAMP 
                    WHERE complaint_id = ? AND resumed_at IS NULL`,
                    [complaintId]
                );
                
                // Update complaint status
                await connection.execute(
                    `UPDATE complaints 
                    SET is_on_hold = FALSE,
                        hold_reason_id = NULL,
                        status = 'In Progress',
                        updated_at = CURRENT_TIMESTAMP,
                        work_paused_at = NULL,
                        is_timer_running = TRUE,
                        last_timer_action = 'start'
                    WHERE id = ?`,
                    [complaintId]
                );
                
                await connection.commit();
                
                return {
                    success: true,
                    message: 'Complaint resumed successfully'
                };
                
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
            
        } catch (error) {
            console.error('Error in resumeComplaint:', error);
            // Make sure to release connection even on error
            if (connection && connection.release) {
                connection.release();
            }
            throw error;
        }
    }

    // Get hold history for a complaint
    static async getHoldHistory(complaintId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    chr.*,
                    CONCAT(u.firstname, ' ', u.lastname) as technician_name,
                    u.email as technician_email,
                    u.mobile as technician_mobile
                FROM complaint_hold_reasons chr
                LEFT JOIN users u ON chr.technician_id = u.id
                WHERE chr.complaint_id = ?
                ORDER BY chr.held_at DESC`,
                [complaintId]
            );
            
            return rows;
            
        } catch (error) {
            console.error('Error in getHoldHistory:', error);
            throw error;
        }
    }

    // Get current hold status for a complaint
    static async getCurrentHoldStatus(complaintId) {
        try {
            const [rows] = await pool.execute(
                `SELECT 
                    c.is_on_hold,
                    chr.id as hold_reason_id,
                    chr.reason,
                    chr.expected_resolution_date,
                    chr.held_at,
                    chr.resumed_at,
                    CONCAT(u.firstname, ' ', u.lastname) as technician_name
                FROM complaints c
                LEFT JOIN complaint_hold_reasons chr ON c.hold_reason_id = chr.id
                LEFT JOIN users u ON chr.technician_id = u.id
                WHERE c.id = ? AND c.is_on_hold = TRUE`,
                [complaintId]
            );
            
            return rows[0] || null;
            
        } catch (error) {
            console.error('Error in getCurrentHoldStatus:', error);
            throw error;
        }
    }

    // Check if house owner can close complaint
    static async canHouseOwnerClose(complaintId, houseownerId) {
        try {
            const [rows] = await pool.execute(
                `SELECT id, status, houseowner_id, resolved_at, is_timer_running
                FROM complaints 
                WHERE id = ? AND houseowner_id = ?`,
                [complaintId, houseownerId]
            );
            
            if (rows.length === 0) {
                return { canClose: false, reason: 'Complaint not found or unauthorized' };
            }
            
            const complaint = rows[0];
            
            if (complaint.status !== 'Resolved') {
                return { canClose: false, reason: 'Only resolved complaints can be closed' };
            }
            
            // Check if timer is stopped (work is completed)
            if (complaint.is_timer_running) {
                return { canClose: false, reason: 'Work is still in progress. Timer must be stopped first.' };
            }
            
            return { canClose: true, complaint: complaint };
        } catch (error) {
            console.error('Error in canHouseOwnerClose:', error);
            return { canClose: false, reason: 'Error checking access' };
        }
    }

    // Check if house owner can reopen complaint
    static async canHouseOwnerReopen(complaintId, houseownerId) {
        try {
            const [rows] = await pool.execute(
                `SELECT id, status, houseowner_id, resolved_at, is_on_hold
                FROM complaints 
                WHERE id = ? AND houseowner_id = ?`,
                [complaintId, houseownerId]
            );
            
            if (rows.length === 0) {
                return { canReopen: false, reason: 'Complaint not found or unauthorized' };
            }
            
            const complaint = rows[0];
            
            // Can only reopen if status is Resolved
            if (complaint.status !== 'Resolved') {
                return { canReopen: false, reason: 'Only resolved complaints can be reopened' };
            }
            
            // Check if complaint is on hold
            if (complaint.is_on_hold) {
                return { canReopen: false, reason: 'Cannot reopen a complaint that is on hold' };
            }
            
            return { canReopen: true, complaint: complaint };
        } catch (error) {
            console.error('Error in canHouseOwnerReopen:', error);
            return { canReopen: false, reason: 'Error checking access' };
        }
    }

    // House owner closes complaint
    static async houseOwnerClose(complaintId, houseownerId) {
        const connection = await pool.getConnection();
        
        try {
            // Verify house owner can close
            const accessCheck = await this.canHouseOwnerClose(complaintId, houseownerId);
            if (!accessCheck.canClose) {
                throw new Error(accessCheck.reason);
            }
            
            const [result] = await pool.execute(
                `UPDATE complaints 
                SET status = 'Closed',
                    updated_at = CURRENT_TIMESTAMP,
                    resolved_at = COALESCE(resolved_at, CURRENT_TIMESTAMP)
                WHERE id = ? AND houseowner_id = ?`,
                [complaintId, houseownerId]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Failed to close complaint');
            }
            
            return { success: true, message: 'Complaint closed successfully' };
            
        } catch (error) {
            console.error('Error in houseOwnerClose:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // House owner reopens complaint
    static async houseOwnerReopen(complaintId, houseownerId) {
        const connection = await pool.getConnection();
        
        try {
            // Verify house owner can reopen
            const accessCheck = await this.canHouseOwnerReopen(complaintId, houseownerId);
            if (!accessCheck.canReopen) {
                throw new Error(accessCheck.reason);
            }
            
            const [result] = await pool.execute(
                `UPDATE complaints 
                SET status = 'Pending',
                    updated_at = CURRENT_TIMESTAMP,
                    resolved_at = NULL
                WHERE id = ? AND houseowner_id = ?`,
                [complaintId, houseownerId]
            );
            
            if (result.affectedRows === 0) {
                throw new Error('Failed to reopen complaint');
            }
            
            return { success: true, message: 'Complaint reopened successfully' };
            
        } catch (error) {
            console.error('Error in houseOwnerReopen:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Check if complaint has been rated
    static async hasBeenRated(complaintId) {
        try {
            const [rows] = await pool.execute(
                `SELECT id FROM complaint_ratings WHERE complaint_id = ?`,
                [complaintId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking rating status:', error);
            return false;
        }
    }

    static async delete(id, companyId) {
        await pool.execute(
            `Delete FROM complaints WHERE id = ? AND company_id = ?`,
            [id, companyId]
        );
        return true;
    }
}



module.exports = Complaint;