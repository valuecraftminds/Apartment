// //models/GenerateBills.js
const pool = require('../db');

class GenerateBills{
    static async create(generateBillData){
        const {company_id, bill_id, year, month,totalAmount,assignedHouses,unitPrice} = generateBillData;
       
        const [result] = await pool.execute(
            'INSERT INTO generate_bills (company_id, bill_id, year, month,totalAmount,assignedHouses,unitPrice) VALUES (?, ?, ?, ?,?,?,?)',
            [company_id, bill_id, year, month,totalAmount,assignedHouses,unitPrice]
        );
        
        return { 
            id: result.insertId, 
            company_id, 
            bill_id, 
            year, 
            month,
            totalAmount,
            assignedHouses,
            unitPrice
        };        
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

    static async checkDuplicate(company_id, bill_id, year, month) {
        const [rows] = await pool.execute(
            'SELECT * FROM generate_bills WHERE company_id = ? AND bill_id = ? AND year = ? AND month = ?',
            [company_id, bill_id, year, month]
        );
        return rows.length > 0;
    }

    static async update(id, generateBillData) {
        const { year, month, totalAmount,unitPrice } = generateBillData;
        await pool.execute(
            'UPDATE generate_bills SET year=?, month=?, totalAmount=?, assignedHouses=? ,unitPrice=? WHERE id = ?',
            [year, month, totalAmount,unitPrice, id]
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
}
module.exports = GenerateBills;
