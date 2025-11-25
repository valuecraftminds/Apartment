// //models/GenerateBills.js
// const pool = require('../db');

// class GenerateBills{
//     static async create(generateBillData){
//         const {company_id, bill_id,year,month} = generateBillData;
       
//         const[result] = await pool.execute(
//             'INSERT INTO generate_bills(id, company_id, bill_id,year,month) values (?, ?, ?, ?,?) ',
//             [id, company_id, bill_id,year,month]
//         );
//         return { id, ...generateBillData };        
//     } 

//     static async findById(id) {
//         const [rows] = await pool.execute(
//             'SELECT * FROM generate_bills WHERE id = ?',
//             [id]
//         );
//         return rows[0];
//     }

//     static async findByCompanyId(company_id){
//         const [rows] = await pool.execute(
//             'SELECT * FROM generate_bills WHERE company_id=? ORDER BY created_at ASC',
//             [company_id]
//         );
//         return rows;
//     }

//     static async findByBillId(bill_id) {
//     const [rows] = await pool.execute(
//         'SELECT * FROM generate_bills WHERE bill_id=? ORDER BY created_at ASC',
//         [bill_id]
//     );
//     return rows;
//     }
// }
// module.exports=GenerateBills;

const pool = require('../db');

class GenerateBills{
    static async create(generateBillData){
        const {company_id, bill_id, year, month} = generateBillData;
       
        const [result] = await pool.execute(
            'INSERT INTO generate_bills (company_id, bill_id, year, month) VALUES (?, ?, ?, ?)',
            [company_id, bill_id, year, month]
        );
        
        return { 
            id: result.insertId, 
            company_id, 
            bill_id, 
            year, 
            month 
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
}
module.exports = GenerateBills;
