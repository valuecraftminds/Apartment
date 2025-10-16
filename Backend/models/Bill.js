const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Bills{
    static async create(billData){
        const {company_id, apartment_id, bill_name} = billData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const[result] = await pool.execute(
            'INSERT INTO bills(id, company_id, apartment_id, bill_name) values (?, ?, ?, ?) ',
            [id, company_id, apartment_id, bill_name]
        );
        return { id, ...billData };        
    } 
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM bills WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM bills WHERE company_id=? ORDER BY created_at ASC',
            [company_id]
        );
        return rows;
    }static async findByApartment(apartment_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM bills WHERE apartment_id=? ORDER BY created_at ASC',
        [apartment_id]
    );
    return rows;
}

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM bills ORDER BY created_at DESC'
        );
        return rows; 
    }

    static async update(id, billData) {
        const {bill_name } = billData;
        await pool.execute(
            'UPDATE bills SET bill_name=? WHERE id = ?',
            [ bill_name,id]
        );
        return { id, ...billData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM bills WHERE id = ?',
            [id]
        );
        return true;
    }    
}
module.exports = Bills;