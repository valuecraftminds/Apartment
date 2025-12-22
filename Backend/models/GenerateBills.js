// models/GenerateBills.js
const pool = require('../db');

class GenerateBills{
    static async create(generateBillData){
        const {company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id} = generateBillData;
       
        const [result] = await pool.execute(
            'INSERT INTO generate_bills (company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id]
        );
        
        return { 
            id: result.insertId, 
            company_id, 
            bill_id, 
            year, 
            month,
            totalAmount,
            assignedHouses,
            unitPrice,
            apartment_id,
            floor_id,
            house_id
        };        
    }

    // NEW: Create multiple bills at once
    static async createMultiple(billsData) {
        const placeholders = billsData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
        const values = [];
        
        billsData.forEach(bill => {
            values.push(
                bill.company_id,
                bill.bill_id,
                bill.year,
                bill.month,
                bill.totalAmount,
                bill.assignedHouses,
                bill.unitPrice,
                bill.apartment_id,
                bill.floor_id,
                bill.house_id
            );
        });

        const [result] = await pool.execute(
            `INSERT INTO generate_bills (company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id) VALUES ${placeholders}`,
            values
        );

        return billsData.map((bill, index) => ({
            id: result.insertId + index,
            ...bill
        }));
    }

    //store bill payments
    static async createBillPayment(billPaymentData) {
        const {
            id, company_id, apartment_id, floor_id, house_id, bill_id, 
            generate_bills_id, pendingAmount, due_date
        } = billPaymentData;
        
        const [result] = await pool.execute(
            `INSERT INTO bill_payments 
            (id, company_id, apartment_id, floor_id, house_id, bill_id, generate_bills_id, pendingAmount, due_date, payment_status, paidAmount, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [id, company_id, apartment_id, floor_id, house_id, bill_id, generate_bills_id, pendingAmount, due_date]
        );
        
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM generate_bills WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT gb.*, b.bill_name, b.billtype FROM generate_bills gb LEFT JOIN bills b ON gb.bill_id = b.id WHERE gb.company_id = ? ORDER BY gb.created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByBillId(bill_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM generate_bills WHERE bill_id = ? ORDER BY created_at DESC',
            [bill_id]
        );
        return rows;
    }

    // Update duplicate check to include apartment_id and house_id
    static async checkDuplicate(company_id, bill_id, year, month, apartment_id, house_id = null) {
        let query = 'SELECT * FROM generate_bills WHERE company_id = ? AND bill_id = ? AND year = ? AND month = ? AND apartment_id = ?';
        const params = [company_id, bill_id, year, month, apartment_id];
        
        if (house_id) {
            query += ' AND house_id = ?';
            params.push(house_id);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows.length > 0;
    }

    // NEW: Get assigned houses by apartment, floor, or individual houses
    static async getAssignedHouses(bill_id, apartment_id, floor_id = null) {
        let query = `
            SELECT ba.*, h.house_id as house_number, f.floor_id as floor_number, a.name as apartment_name
            FROM bill_assignments ba
            JOIN houses h ON ba.house_id = h.id
            JOIN floors f ON h.floor_id = f.id
            JOIN apartments a ON f.apartment_id = a.id
            WHERE ba.bill_id = ? AND ba.apartment_id = ?
        `;
        const params = [bill_id, apartment_id];
        
        if (floor_id) {
            query += ' AND h.floor_id = ?';
            params.push(floor_id);
        }
        
        query += ' ORDER BY f.floor_id, h.house_id';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // NEW: Get floors for apartment with house counts
    static async getFloorsWithHouseCounts(apartment_id, bill_id) {
        const [rows] = await pool.execute(
            `SELECT f.*, COUNT(ba.house_id) as assigned_houses_count
             FROM floors f
             LEFT JOIN houses h ON f.id = h.floor_id
             LEFT JOIN bill_assignments ba ON h.id = ba.house_id AND ba.bill_id = ?
             WHERE f.apartment_id = ?
             GROUP BY f.id
             ORDER BY f.floor_id`,
            [bill_id, apartment_id]
        );
        return rows;
    }

    static async update(id, generateBillData) {
        const { year, month, totalAmount, unitPrice } = generateBillData;
        await pool.execute(
            'UPDATE generate_bills SET year=?, month=?, totalAmount=?, unitPrice=? WHERE id = ?',
            [year, month, totalAmount, unitPrice, id]
        );
        return { id, ...generateBillData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM generate_bills WHERE id = ?',
            [id]
        );
        return true;
    }

    // Keep the count method for apartment-level generation
    static async getAssignedHousesCountByApartment(bill_id, apartment_id) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM bill_assignments WHERE bill_id = ? AND apartment_id = ?',
            [bill_id, apartment_id]
        );
        return rows[0].count;
    }
}
module.exports = GenerateBills;
