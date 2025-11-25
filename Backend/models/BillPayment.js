// models/BillPayments.js
const pool = require('../db');

class BillPayments {
    static async findAllByCompany(company_id, filters = {}) {
        let query = `
            SELECT 
                bp.*,
                b.bill_name,
                b.billtype,
                gb.month,
                gb.year,
                gb.unitPrice,
                gb.totalAmount as generated_total_amount,
                a.name as apartment_name,
                f.floor_id,
                h.house_id as house_number,
                ht.name as house_type
            FROM bill_payments bp
            LEFT JOIN bills b ON bp.bill_id = b.id
            LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
            LEFT JOIN apartments a ON bp.apartment_id = a.id
            LEFT JOIN floors f ON bp.floor_id = f.id
            LEFT JOIN houses h ON bp.house_id = h.id
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            WHERE bp.company_id = ?
        `;
        
        const params = [company_id];
        
        // Add filters
        if (filters.payment_status) {
            query += ' AND bp.payment_status = ?';
            params.push(filters.payment_status);
        }
        
        if (filters.apartment_id) {
            query += ' AND bp.apartment_id = ?';
            params.push(filters.apartment_id);
        }
        
        if (filters.bill_id) {
            query += ' AND bp.bill_id = ?';
            params.push(filters.bill_id);
        }
        
        if (filters.month) {
            query += ' AND gb.month = ?';
            params.push(filters.month);
        }
        
        if (filters.year) {
            query += ' AND gb.year = ?';
            params.push(filters.year);
        }
        
        query += ' ORDER BY bp.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT 
                bp.*,
                b.bill_name,
                b.billtype,
                gb.month,
                gb.year,
                gb.unitPrice,
                gb.totalAmount as generated_total_amount,
                a.name as apartment_name,
                f.floor_id,
                h.house_id as house_number,
                ht.name as house_type
            FROM bill_payments bp
            LEFT JOIN bills b ON bp.bill_id = b.id
            LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
            LEFT JOIN apartments a ON bp.apartment_id = a.id
            LEFT JOIN floors f ON bp.floor_id = f.id
            LEFT JOIN houses h ON bp.house_id = h.id
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            WHERE bp.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async getPaymentSummary(company_id) {
        const [rows] = await pool.execute(
            `SELECT 
                payment_status,
                COUNT(*) as count,
                SUM(paidAmount) as total_paid,
                SUM(pendingAmount) as total_pending
            FROM bill_payments 
            WHERE company_id = ?
            GROUP BY payment_status`,
            [company_id]
        );
        return rows;
    }

    static async updatePaymentStatus(id, payment_status, paidAmount = null) {
        let query = 'UPDATE bill_payments SET payment_status = ?';
        const params = [payment_status];
        
        if (paidAmount !== null) {
            query += ', paidAmount = ?, pendingAmount = unitPrice - ?';
            params.push(paidAmount, paidAmount);
        }
        
        if (payment_status === 'Paid') {
            query += ', paid_at = CURRENT_TIMESTAMP';
        } else {
            query += ', paid_at = NULL';
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        await pool.execute(query, params);
        
        return this.findById(id);
    }

    static async getMonthlySummary(company_id, year) {
        const [rows] = await pool.execute(
            `SELECT 
                gb.month,
                gb.year,
                COUNT(bp.id) as total_payments,
                SUM(bp.paidAmount) as total_collected,
                SUM(bp.pendingAmount) as total_pending
            FROM generate_bills gb
            LEFT JOIN bill_payments bp ON gb.id = bp.generate_bills_id
            WHERE gb.company_id = ? AND gb.year = ?
            GROUP BY gb.month, gb.year
            ORDER BY gb.year DESC, 
                FIELD(gb.month, 'January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December')`,
            [company_id, year]
        );
        return rows;
    }
}

module.exports = BillPayments;