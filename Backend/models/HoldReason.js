const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class HoldReason {
    // Put complaint on hold
    static async create(holdData) {
        const { complaint_id, technician_id, reason, expected_resolution_date } = holdData;
        const id = uuidv4();
        
        const [result] = await pool.execute(
            `INSERT INTO complaint_hold_reasons 
             (id, complaint_id, technician_id, reason, expected_resolution_date) 
             VALUES (?, ?, ?, ?, ?)`,
            [id, complaint_id, technician_id, reason, expected_resolution_date]
        );
        
        return { id, ...holdData };
    }

    // Resume complaint from hold
    static async resume(complaint_id, technician_id) {
        await pool.execute(
            `UPDATE complaint_hold_reasons 
             SET resumed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
             WHERE complaint_id = ? AND technician_id = ? AND resumed_at IS NULL`,
            [complaint_id, technician_id]
        );
        return true;
    }

    // Get active hold reason for complaint
    static async getActiveHold(complaint_id) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_hold_reasons 
             WHERE complaint_id = ? AND resumed_at IS NULL 
             ORDER BY held_at DESC LIMIT 1`,
            [complaint_id]
        );
        return rows[0];
    }

    // Get all hold reasons for complaint
    static async getComplaintHolds(complaint_id) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_hold_reasons 
             WHERE complaint_id = ? 
             ORDER BY held_at DESC`,
            [complaint_id]
        );
        return rows;
    }

    // Get technician's hold reasons
    static async getTechnicianHolds(technician_id) {
        const [rows] = await pool.execute(
            `SELECT cr.*, c.complaint_number, c.title 
             FROM complaint_hold_reasons cr
             JOIN complaints c ON cr.complaint_id = c.id
             WHERE cr.technician_id = ? AND cr.resumed_at IS NULL
             ORDER BY cr.held_at DESC`,
            [technician_id]
        );
        return rows;
    }
}

module.exports = HoldReason;