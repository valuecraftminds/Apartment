const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class BillPrice{
    static async create(billPriceData){
        const {company_id, bill_id, billrange_id, year, month, unitprice, fixedamount} = billPriceData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const[result] = await pool.execute(
            'INSERT INTO billprice(id, company_id, bill_id, billrange_id, year, month, unitprice, fixedamount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, company_id, bill_id, billrange_id, year, month, unitprice, fixedamount]
        );
        return { id, ...billPriceData };        
    } 

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM billprice WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM billprice WHERE company_id=? ORDER BY created_at ASC',
            [company_id]
        );
        return rows;
    }

    static async findByBillId(bill_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM billprice WHERE bill_id=? ORDER BY created_at ASC',
            [bill_id]
        );
        return rows;
    }

    static async findByBillRangeId(billrange_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM billprice WHERE billrange_id=? ORDER BY created_at ASC',
            [billrange_id]
        );
        return rows;
    }

    // NEW: Find by both bill_id and billrange_id
    static async findByBillAndRange(bill_id, billrange_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM billprice WHERE bill_id=? AND billrange_id=? ORDER BY created_at ASC',
            [bill_id, billrange_id]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM billprice ORDER BY created_at ASC'
        );
        return rows; 
    }

    static async update(id, billPriceData) {
        const { year, month, unitprice, fixedamount } = billPriceData;
        await pool.execute(
            'UPDATE billprice SET year=?, month=?, unitprice=?, fixedamount=? WHERE id = ?',
            [year, month, unitprice, fixedamount, id]
        );
        return { id, ...billPriceData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM billprice WHERE id = ?',
            [id]
        );
        return true;
    }    
}

module.exports = BillPrice;