//models/GenerateMeasurableBill.js
const pool = require('../db');

class GenerateMeasurableBill {
    static async create(generateMeasurableBillData){
        const { company_id, apartment_id,floor_id,house_id,bill_id,year,month,previous_reading, current_reading, used_units, totalAmount } = generateMeasurableBillData;
        const [result] = await pool.execute(
            `INSERT INTO generateMeasurable_bills 
            (company_id, apartment_id, floor_id, house_id, bill_id, year, month, 
             previous_reading, current_reading, used_units, totalAmount) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                company_id, apartment_id, floor_id, house_id, bill_id, year, month,
                previous_reading, current_reading, used_units, totalAmount
            ]
        );
        
        return {
            id: result.insertId,
            ...generateMeasurableBillData
        };
    }

    static async createMultiple(billsData) {
        if (!billsData.length) return [];
        
        const placeholders = billsData.map(() => 
            '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).join(',');
        
        const values = [];
        
        billsData.forEach(bill => {
            values.push(
                bill.company_id,
                bill.apartment_id,
                bill.floor_id,
                bill.house_id,
                bill.bill_id,
                bill.year,
                bill.month,
                bill.previous_reading || 0,
                bill.current_reading || 0,
                bill.used_units || 0,
                bill.totalAmount || 0
            );
        });

        const [result] = await pool.execute(
            `INSERT INTO generateMeasurable_bills 
            (company_id, apartment_id, floor_id, house_id, bill_id, year, month, 
             previous_reading, current_reading, used_units, totalAmount) 
            VALUES ${placeholders}`,
            values
        );

        return billsData.map((bill, index) => ({
            id: result.insertId + index,
            ...bill
        }));
    }

    // Find by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT gmb.*, b.bill_name, b.billtype, 
                    h.house_id as house_number, f.floor_id as floor_number, a.name as apartment_name
             FROM generateMeasurable_bills gmb
             LEFT JOIN bills b ON gmb.bill_id = b.id
             LEFT JOIN houses h ON gmb.house_id = h.id
             LEFT JOIN floors f ON gmb.floor_id = f.id
             LEFT JOIN apartments a ON gmb.apartment_id = a.id
             WHERE gmb.id = ?`,
            [id]
        );
        return rows[0];
    }

    // Find by company ID (with bill details)
    static async findByCompanyId(company_id) {
        const [rows] = await pool.execute(
            `SELECT gmb.*, b.bill_name, b.billtype, 
                    h.house_id as house_number, f.floor_id as floor_number, a.name as apartment_name
             FROM generateMeasurable_bills gmb
             LEFT JOIN bills b ON gmb.bill_id = b.id
             LEFT JOIN houses h ON gmb.house_id = h.id
             LEFT JOIN floors f ON gmb.floor_id = f.id
             LEFT JOIN apartments a ON gmb.apartment_id = a.id
             WHERE gmb.company_id = ? 
             ORDER BY gmb.year DESC, 
                      CASE gmb.month 
                        WHEN 'January' THEN 1
                        WHEN 'February' THEN 2
                        WHEN 'March' THEN 3
                        WHEN 'April' THEN 4
                        WHEN 'May' THEN 5
                        WHEN 'June' THEN 6
                        WHEN 'July' THEN 7
                        WHEN 'August' THEN 8
                        WHEN 'September' THEN 9
                        WHEN 'October' THEN 10
                        WHEN 'November' THEN 11
                        WHEN 'December' THEN 12
                      END DESC,
                      gmb.created_at DESC`,
            [company_id]
        );
        return rows;
    }

    // Find by bill ID
    static async findByBillId(bill_id, company_id = null) {
        let query = `SELECT gmb.*, b.bill_name, b.billtype, 
                            h.house_id as house_number, f.floor_id as floor_number, a.name as apartment_name
                     FROM generateMeasurable_bills gmb
                     LEFT JOIN bills b ON gmb.bill_id = b.id
                     LEFT JOIN houses h ON gmb.house_id = h.id
                     LEFT JOIN floors f ON gmb.floor_id = f.id
                     LEFT JOIN apartments a ON gmb.apartment_id = a.id
                     WHERE gmb.bill_id = ?`;
        
        const params = [bill_id];
        
        if (company_id) {
            query += ' AND gmb.company_id = ?';
            params.push(company_id);
        }
        
        query += ' ORDER BY gmb.year DESC, gmb.month DESC, gmb.created_at DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Find by house ID (for house history)
    static async findByHouseId(house_id, company_id = null) {
        let query = `SELECT gmb.*, b.bill_name, b.billtype
                     FROM generateMeasurable_bills gmb
                     LEFT JOIN bills b ON gmb.bill_id = b.id
                     WHERE gmb.house_id = ?`;
        
        const params = [house_id];
        
        if (company_id) {
            query += ' AND gmb.company_id = ?';
            params.push(company_id);
        }
        
        query += ' ORDER BY gmb.year DESC, gmb.month DESC';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Check for duplicate bills (for same house, bill, month, year)
    static async checkDuplicate(company_id, bill_id, year, month, house_id) {
        const [rows] = await pool.execute(
            `SELECT * FROM generateMeasurable_bills 
             WHERE company_id = ? AND bill_id = ? AND year = ? AND month = ? AND house_id = ?`,
            [company_id, bill_id, year, month, house_id]
        );
        return rows.length > 0;
    }

    // Get previous reading for a house and bill
    static async getPreviousReading(house_id, bill_id) {
        const [rows] = await pool.execute(
            `SELECT current_reading, month, year 
             FROM generateMeasurable_bills 
             WHERE house_id = ? AND bill_id = ? 
             ORDER BY year DESC, 
                      CASE month 
                        WHEN 'January' THEN 1
                        WHEN 'February' THEN 2
                        WHEN 'March' THEN 3
                        WHEN 'April' THEN 4
                        WHEN 'May' THEN 5
                        WHEN 'June' THEN 6
                        WHEN 'July' THEN 7
                        WHEN 'August' THEN 8
                        WHEN 'September' THEN 9
                        WHEN 'October' THEN 10
                        WHEN 'November' THEN 11
                        WHEN 'December' THEN 12
                      END DESC
             LIMIT 1`,
            [house_id, bill_id]
        );
        return rows[0] || null;
    }

    // Get bills for a specific period (month, year)
    static async findByPeriod(company_id, year, month) {
        const [rows] = await pool.execute(
            `SELECT gmb.*, b.bill_name, b.billtype,
                    h.house_id as house_number, f.floor_id as floor_number, a.name as apartment_name
             FROM generateMeasurable_bills gmb
             LEFT JOIN bills b ON gmb.bill_id = b.id
             LEFT JOIN houses h ON gmb.house_id = h.id
             LEFT JOIN floors f ON gmb.floor_id = f.id
             LEFT JOIN apartments a ON gmb.apartment_id = a.id
             WHERE gmb.company_id = ? AND gmb.year = ? AND gmb.month = ?
             ORDER BY a.name, f.floor_id, h.house_id`,
            [company_id, year, month]
        );
        return rows;
    }

    // Update bill record
    static async update(id, billData) {
        const {
            previous_reading,
            current_reading,
            used_units,
            totalAmount,
            month,
            year
        } = billData;
        
        await pool.execute(
            `UPDATE generateMeasurable_bills 
             SET previous_reading = ?, current_reading = ?, used_units = ?, 
                 totalAmount = ?, month = ?, year = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [previous_reading, current_reading, used_units, totalAmount, month, year, id]
        );
        
        return { id, ...billData };
    }

    // Delete bill record
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM generateMeasurable_bills WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Get statistics for dashboard
    static async getStatistics(company_id, year = null) {
        let query = `
            SELECT 
                COUNT(*) as total_bills,
                SUM(totalAmount) as total_amount,
                AVG(totalAmount) as average_amount,
                COUNT(DISTINCT house_id) as total_houses,
                COUNT(DISTINCT bill_id) as total_bill_types
            FROM generateMeasurable_bills 
            WHERE company_id = ?
        `;
        
        const params = [company_id];
        
        if (year) {
            query += ' AND year = ?';
            params.push(year);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows[0];
    }

    // Get monthly summary
    static async getMonthlySummary(company_id, year) {
        const [rows] = await pool.execute(
            `SELECT 
                month,
                COUNT(*) as bill_count,
                SUM(totalAmount) as total_amount,
                AVG(totalAmount) as average_amount
             FROM generateMeasurable_bills 
             WHERE company_id = ? AND year = ?
             GROUP BY month
             ORDER BY 
                CASE month 
                    WHEN 'January' THEN 1
                    WHEN 'February' THEN 2
                    WHEN 'March' THEN 3
                    WHEN 'April' THEN 4
                    WHEN 'May' THEN 5
                    WHEN 'June' THEN 6
                    WHEN 'July' THEN 7
                    WHEN 'August' THEN 8
                    WHEN 'September' THEN 9
                    WHEN 'October' THEN 10
                    WHEN 'November' THEN 11
                    WHEN 'December' THEN 12
                END`,
            [company_id, year]
        );
        return rows;
    }

    // Create bill payment record (similar to your reference)
    static async createBillPayment(billPaymentData) {
        const {
            id, company_id, apartment_id, floor_id, house_id, bill_id, 
            generateMeasurable_bills_id, pendingAmount, due_date
        } = billPaymentData;
        
        console.log('Creating bill payment with data:', {
            id, generateMeasurable_bills_id, pendingAmount
        });
        
        const [result] = await pool.execute(
            `INSERT INTO bill_payments 
            (id, company_id, apartment_id, floor_id, house_id, bill_id, 
            generateMeasurable_bills_id, pendingAmount, due_date, 
            payment_status, paidAmount, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [
                id, company_id, apartment_id, floor_id, house_id, bill_id,
                generateMeasurable_bills_id, pendingAmount, due_date
            ]
        );
        
        console.log('Bill payment created with ID:', result.insertId);
        return result.insertId;
    }

    // Get bill details with calculation breakdown
    static async getBillWithDetails(id) {
        const [rows] = await pool.execute(
            `SELECT gmb.*, 
                    b.bill_name, b.billtype,
                    h.house_id as house_number, 
                    f.floor_id as floor_number, 
                    a.name as apartment_name,
                    bp.payment_status, bp.paidAmount, bp.pendingAmount
             FROM generateMeasurable_bills gmb
             LEFT JOIN bills b ON gmb.bill_id = b.id
             LEFT JOIN houses h ON gmb.house_id = h.id
             LEFT JOIN floors f ON gmb.floor_id = f.id
             LEFT JOIN apartments a ON gmb.apartment_id = a.id
             LEFT JOIN bill_payments bp ON bp.generateMeasurable_bills_id = gmb.id
             WHERE gmb.id = ?`,
            [id]
        );
        return rows[0];
    }
}
module.exports = GenerateMeasurableBill;