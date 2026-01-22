//models/Rating.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Rating {
    // Submit rating for complaint
    static async create(ratingData) {
        const { company_id,complaint_id, houseowner_id, rating, feedback } = ratingData;
        const id = uuidv4();
        
        const [result] = await pool.execute(
            `INSERT INTO complaint_ratings (id, company_id, complaint_id, houseowner_id, rating, feedback) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id, company_id, complaint_id, houseowner_id, rating, feedback]
        );
        
        return { id, ...ratingData };
    }

    // Get rating by complaint ID
    static async findByComplaintId(complaint_id) {
        const [rows] = await pool.execute(
            `SELECT * FROM complaint_ratings WHERE complaint_id = ?`,
            [complaint_id]
        );
        return rows[0];
    }

    // Get ratings by houseowner
    static async findByHouseOwner(houseowner_id) {
        const [rows] = await pool.execute(
            `SELECT cr.*, c.complaint_number, c.title 
             FROM complaint_ratings cr
             JOIN complaints c ON cr.complaint_id = c.id
             WHERE cr.houseowner_id = ?
             ORDER BY cr.created_at DESC`,
            [houseowner_id]
        );
        return rows;
    }

    // Get average rating for technician
    static async getTechnicianAverage(technician_id) {
        const [rows] = await pool.execute(
            `SELECT AVG(cr.rating) as average_rating, COUNT(*) as total_ratings
             FROM complaint_ratings cr
             JOIN complaints c ON cr.complaint_id = c.id
             WHERE c.assigned_to = ?`,
            [technician_id]
        );
        return rows[0];
    }

    // Get average rating for company
    static async getCompanyAverage(company_id) {
        const [rows] = await pool.execute(
            `SELECT AVG(cr.rating) as average_rating, COUNT(*) as total_ratings
             FROM complaint_ratings cr
             JOIN complaints c ON cr.complaint_id = c.id
             WHERE c.company_id = ?`,
            [company_id]
        );
        return rows[0];
    }
}

module.exports = Rating;