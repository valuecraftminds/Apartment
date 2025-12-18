// models/BillPayment.js
const pool = require('../db')

class BillPayment{
    static async findAllByCompany(company_id, filters = {}) {
        let query = `
            SELECT 
                bp.*,
                b.bill_name,
                b.billtype,
                COALESCE(gb.month, gmb.month) as month,
                COALESCE(gb.year, gmb.year) as year,
                COALESCE(gb.unitPrice, gmb.totalAmount) as unitPrice,
                COALESCE(gb.totalAmount, gmb.totalAmount) as generated_total_amount,
                a.name as apartment_name,
                f.floor_id,
                h.house_id as house_number,
                ht.name as house_type,
                -- Add these to distinguish bill types
                CASE 
                    WHEN bp.generateMeasurable_bills_id IS NOT NULL THEN 'Measurable'
                    WHEN bp.generate_bills_id IS NOT NULL THEN 'Shared'
                    ELSE 'Unknown'
                END as bill_source_type
            FROM bill_payments bp
            LEFT JOIN bills b ON bp.bill_id = b.id
            LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
            LEFT JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
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
        
        if (filters.floor_id) {
            query += ' AND bp.floor_id = ?';
            params.push(filters.floor_id);
        }
        
        if (filters.house_id) {
            query += ' AND bp.house_id = ?';
            params.push(filters.house_id);
        }
        
        // Filter by bill type
        if (filters.billtype) {
            query += ' AND b.billtype = ?';
            params.push(filters.billtype);
        }
        
        // FIXED: Filter by month for BOTH types of bills
        if (filters.month) {
            query += ' AND (gb.month = ? OR gmb.month = ?)';
            params.push(filters.month, filters.month);
        }
        
        // FIXED: Filter by year for BOTH types of bills
        if (filters.year) {
            query += ' AND (gb.year = ? OR gmb.year = ?)';
            params.push(filters.year, filters.year);
        }

        // Filter by bill source type (measurable vs shared)
        if (filters.is_measurable !== undefined) {
            if (filters.is_measurable) {
                query += ' AND bp.generateMeasurable_bills_id IS NOT NULL';
            } else {
                query += ' AND bp.generate_bills_id IS NOT NULL';
            }
        }
        
        // Also add a filter for bill_source_type if needed
        if (filters.bill_source_type) {
            query += ' AND (CASE WHEN bp.generateMeasurable_bills_id IS NOT NULL THEN "Measurable" WHEN bp.generate_bills_id IS NOT NULL THEN "Shared" ELSE "Unknown" END) = ?';
            params.push(filters.bill_source_type);
        }

        query += ' ORDER BY bp.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // static async findById(id) {
    //     const [rows] = await pool.execute(
    //         `SELECT 
    //             bp.*,
    //             b.bill_name,
    //             b.billtype,
    //             COALESCE(gb.month, gmb.month) as month,
    //             COALESCE(gb.year, gmb.year) as year,
    //             gb.unitPrice as unitPrice,
    //             COALESCE(gb.totalAmount, gmb.totalAmount) as generated_total_amount,
    //             a.name as apartment_name,
    //             f.floor_id,
    //             h.house_id as house_number,
    //             ht.name as house_type
    //         FROM bill_payments bp
    //         LEFT JOIN bills b ON bp.bill_id = b.id
    //         LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
    //         LEFT JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
    //         LEFT JOIN apartments a ON bp.apartment_id = a.id
    //         LEFT JOIN floors f ON bp.floor_id = f.id
    //         LEFT JOIN houses h ON bp.house_id = h.id
    //         LEFT JOIN housetype ht ON h.housetype_id = ht.id
    //         WHERE bp.id = ?`,
    //         [id]
    //     );
    //     return rows[0];
    // }
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT 
                bp.*,
                b.bill_name,
                b.billtype,
                COALESCE(gb.month, gmb.month) as month,
                COALESCE(gb.year, gmb.year) as year,
                COALESCE(gb.unitPrice, gmb.totalAmount) as unitPrice,
                COALESCE(gb.totalAmount, gmb.totalAmount) as generated_total_amount,
                a.name as apartment_name,
                f.floor_id,
                h.house_id as house_number,
                ht.name as house_type,
                CASE 
                    WHEN bp.generateMeasurable_bills_id IS NOT NULL THEN 'Measurable'
                    WHEN bp.generate_bills_id IS NOT NULL THEN 'Shared'
                    ELSE 'Unknown'
                END as bill_source_type
            FROM bill_payments bp
            LEFT JOIN bills b ON bp.bill_id = b.id
            LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
            LEFT JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
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

    // static async updatePaymentStatus(id, payment_status, paidAmount = null, paid_at = null) {
    //     // First get the current bill payment to check its type
    //     const currentPayment = await this.findById(id);
    //     if (!currentPayment) {
    //         throw new Error('Payment not found');
    //     }
        
    //     let query = 'UPDATE bill_payments SET payment_status = ?';
    //     const params = [payment_status];
        
    //     if (paidAmount !== null) {
    //         // Get the total amount from the appropriate generated bill table
    //         if (currentPayment.generateMeasurable_bills_id) {
    //             // For measurable bills: Use totalAmount
    //             query += ', paidAmount = ?, pendingAmount = (SELECT totalAmount FROM generateMeasurable_bills WHERE id = ?) - ?';
    //             params.push(paidAmount, currentPayment.generateMeasurable_bills_id, paidAmount);
    //         } else if (currentPayment.generate_bills_id) {
    //             // For shared bills: Use unitPrice
    //             query += ', paidAmount = ?, pendingAmount = (SELECT unitPrice FROM generate_bills WHERE id = ?) - ?';
    //             params.push(paidAmount, currentPayment.generate_bills_id, paidAmount);
    //         } else {
    //             // Fallback: Try to get amount from payment record itself
    //             query += ', paidAmount = ?, pendingAmount = unitPrice - ?';
    //             params.push(paidAmount, paidAmount);
    //         }
    //     }
        
    //     // Handle paid_at date
    //     if (paid_at) {
    //         query += ', paid_at = ?';
    //         params.push(paid_at);
    //     } else if (payment_status === 'Paid') {
    //         query += ', paid_at = CURRENT_TIMESTAMP';
    //     } else if (payment_status === 'Pending' && paidAmount === 0) {
    //         query += ', paid_at = NULL';
    //     }
    //     // For Partial payments
    //     else if (payment_status === 'Partial' && paidAmount > 0) {
    //         query += ', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)';
    //     }
        
    //     query += ' WHERE id = ?';
    //     params.push(id);
        
    //     await pool.execute(query, params);
        
    //     return this.findById(id);
    // }

    static async updatePaymentStatus(id, payment_status, paidAmount = null, paid_at = null) {
        // First get the current bill payment to check its type
        const currentPayment = await this.findById(id);
        if (!currentPayment) {
            throw new Error('Payment not found');
        }
        
        let query = 'UPDATE bill_payments SET payment_status = ?';
        const params = [payment_status];
        
        if (paidAmount !== null) {
            // Get the total amount from the appropriate generated bill table
            if (currentPayment.generateMeasurable_bills_id) {
                // For measurable bills: Use totalAmount
                query += ', paidAmount = ?, pendingAmount = (SELECT totalAmount FROM generateMeasurable_bills WHERE id = ?) - ?';
                params.push(paidAmount, currentPayment.generateMeasurable_bills_id, paidAmount);
            } else if (currentPayment.generate_bills_id) {
                // For shared bills: Use unitPrice
                query += ', paidAmount = ?, pendingAmount = (SELECT unitPrice FROM generate_bills WHERE id = ?) - ?';
                params.push(paidAmount, currentPayment.generate_bills_id, paidAmount);
            } else {
                // Fallback: Try to get amount from payment record itself
                query += ', paidAmount = ?, pendingAmount = unitPrice - ?';
                params.push(paidAmount, paidAmount);
            }
        }
        
        // Handle paid_at date - Convert to MySQL DATETIME format
        if (paid_at) {
            // Convert ISO string to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
            const mysqlDatetime = new Date(paid_at).toISOString().slice(0, 19).replace('T', ' ');
            query += ', paid_at = ?';
            params.push(mysqlDatetime);
        } else if (payment_status === 'Paid') {
            query += ', paid_at = CURRENT_TIMESTAMP';
        } else if (payment_status === 'Pending' && paidAmount === 0) {
            query += ', paid_at = NULL';
        }
        // For Partial payments
        else if (payment_status === 'Partial' && paidAmount > 0) {
            query += ', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP)';
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        console.log('Query:', query); // Debug
        console.log('Params:', params); // Debug
        
        await pool.execute(query, params);
        
        return this.findById(id);
    }

    static async getMonthlySummary(company_id, year) {
        const [rows] = await pool.execute(
            `SELECT 
                COALESCE(gb.month, gmb.month) as month,
                COALESCE(gb.year, gmb.year) as year,
                COUNT(bp.id) as total_payments,
                SUM(bp.paidAmount) as total_collected,
                SUM(bp.pendingAmount) as total_pending
            FROM bill_payments bp
            LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
            LEFT JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
            WHERE bp.company_id = ? 
                AND (gb.year = ? OR gmb.year = ? OR (gb.year IS NULL AND gmb.year IS NULL))
            GROUP BY COALESCE(gb.month, gmb.month), COALESCE(gb.year, gmb.year)
            ORDER BY COALESCE(gb.year, gmb.year) DESC, 
                FIELD(COALESCE(gb.month, gmb.month), 'January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December')`,
            [company_id, year, year]
        );
        return rows;
    }

    // Add this to models/BillPayment.js
    static async findMeasurableBillPayments(company_id, filters = {}) {
        let query = `
            SELECT 
                bp.*,
                b.bill_name,
                b.billtype,
                gmb.month,
                gmb.year,
                gmb.unitPrice,
                gmb.totalAmount as generated_total_amount,
                gmb.previous_reading,
                gmb.current_reading,
                gmb.used_units,
                a.name as apartment_name,
                f.floor_id,
                h.house_id as house_number,
                ht.name as house_type
            FROM bill_payments bp
            INNER JOIN bills b ON bp.bill_id = b.id
            INNER JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
            LEFT JOIN apartments a ON bp.apartment_id = a.id
            LEFT JOIN floors f ON bp.floor_id = f.id
            LEFT JOIN houses h ON bp.house_id = h.id
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            WHERE bp.company_id = ? AND bp.generateMeasurable_bills_id IS NOT NULL
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
        
        if (filters.month) {
            query += ' AND gmb.month = ?';
            params.push(filters.month);
        }
        
        if (filters.year) {
            query += ' AND gmb.year = ?';
            params.push(filters.year);
        }
        
        query += ' ORDER BY gmb.year DESC, CASE gmb.month WHEN "January" THEN 1 WHEN "February" THEN 2 WHEN "March" THEN 3 WHEN "April" THEN 4 WHEN "May" THEN 5 WHEN "June" THEN 6 WHEN "July" THEN 7 WHEN "August" THEN 8 WHEN "September" THEN 9 WHEN "October" THEN 10 WHEN "November" THEN 11 WHEN "December" THEN 12 END DESC, bp.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM bill_payments WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }    
}

module.exports=BillPayment;