const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class SharedValuePrice{
    static async create(sharedValuePriceData){
        const {company_id, bill_id, year, month, amount} = sharedValuePriceData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const[result] = await pool.execute(
            'INSERT INTO shared_value_price(id, company_id, bill_id, year, month, amount) VALUES (?, ?, ?, ?, ?, ?)',
            [id, company_id, bill_id, year, month,amount]
        );
        return { id, ...sharedValuePriceData };        
    } 

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM shared_value_price WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM shared_value_price WHERE company_id=? ORDER BY created_at ASC',
            [company_id]
        );
        return rows;
    }

    static async findByBillId(bill_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM shared_value_price WHERE bill_id=? ORDER BY created_at ASC',
            [bill_id]
        );
        return rows;
    }

    // NEW: Find by both bill_id and billrange_id
    // static async findByBillAndRange(bill_id, billrange_id) {
    //     const [rows] = await pool.execute(
    //         'SELECT * FROM billprice WHERE bill_id=? AND billrange_id=? ORDER BY created_at ASC',
    //         [bill_id, billrange_id]
    //     );
    //     return rows;
    // }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM shared_value_price ORDER BY created_at ASC'
        );
        return rows; 
    }

    static async update(id, sharedValuePriceData) {
        const { year, month, amount } = sharedValuePriceData;
        await pool.execute(
            'UPDATE shared_value_price SET year=?, month=?, amount=? WHERE id = ?',
            [year, month, amount, id]
        );
        return { id, ...sharedValuePriceData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM shared_value_price WHERE id = ?',
            [id]
        );
        return true;
    }    
}

module.exports = SharedValuePrice;