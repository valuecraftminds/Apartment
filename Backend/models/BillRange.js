const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class BillRange{
    static async create(billRangeData){
        const {company_id,bill_id, fromRange,toRange,unitPrice} = billRangeData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const[result] = await pool.execute(
            'INSERT INTO billrange(id, company_id, bill_id, fromRange, toRange, unitPrice, is_active) values (?, ?, ?, ?, ?, ?, 1) ',
            [id, company_id, bill_id, fromRange, toRange, unitPrice]
        );
        return { id, ...billRangeData };        
    } 
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM billrange WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM billrange WHERE company_id=? ORDER BY created_at ASC',
            [company_id]
        );
        return rows;
    }
    // static async findByApartment(apartment_id) {
    // const [rows] = await pool.execute(
    //     'SELECT * FROM bills WHERE apartment_id=? ORDER BY created_at ASC',
    //     [apartment_id]
    // );
    // return rows;
    // }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM billrange ORDER BY created_at ASC'
        );
        return rows; 
    }

    static async update(id, billRangeData) {
        const {fromRange,toRange,unitPrice } = billRangeData;
        await pool.execute(
            'UPDATE billrange SET fromRange = ?,toRange = ?, unitPrice = ? WHERE id = ?',
            [ fromRange,toRange,unitPrice,id]
        );
        return { id, ...billRangeData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM billrange WHERE id = ?',
            [id]
        );
        return true;
    }    
}
module.exports = BillRange;