const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Bills{
    static async create(billData){
        const {company_id, bill_name,billtype} = billData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const[result] = await pool.execute(
            'INSERT INTO bills(id, company_id, bill_name,billtype, is_metered) values (?, ?, ?, ?, 1) ',
            [id, company_id, bill_name,billtype]
        );
        return { id, ...billData };        
    } 

    // Check for similar bill names (case-insensitive, ignoring spaces and special characters)
    static async findSimilarBillName(company_id, bill_name) {
        // Normalize the input: lowercase, remove extra spaces, remove common words
        const normalizedInput = bill_name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\b(bill|charge|fee|payment|amount)\b/gi, '') // Remove common words
            .trim();
        
        const [rows] = await pool.execute(
            `SELECT * FROM bills 
             WHERE company_id = ? 
             AND (
                 LOWER(TRIM(bill_name)) = LOWER(TRIM(?)) OR
                 LOWER(REPLACE(bill_name, ' ', '')) = LOWER(REPLACE(?, ' ', '')) OR
                 SOUNDEX(bill_name) = SOUNDEX(?)
             )`,
            [company_id, bill_name, bill_name, bill_name]
        );
        return rows.length > 0;
    }

    static async findByBillName(bill_name){
        const [rows] = await pool.execute(
            'SELECT * FROM bills WHERE bill_name=? & company_id=?',
            [bill_name]
        );
        return rows[0];
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
    }
    static async findByApartment(apartment_id) {
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
        const {bill_name,billtype } = billData;
        await pool.execute(
            'UPDATE bills SET bill_name=?, billtype=? WHERE id = ?',
            [ bill_name,billtype,id]
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