const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class House{
    static async create(houseData){
        const [company_id,apartment_id,floor_id,house_id,type, rooms,bathrooms,status,occupied_way]=houseData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const [result] = await pool.execute(
            'INSERT INTO house (id, company_id, apartment_id, floor_id, house_id,type, rooms,bathrooms,status,occupied_way) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?)',
            [company_id, apartment_id, apartment_id, floor_id, house_id,type, rooms,bathrooms,status,occupied_way,id]
        );
        return { id, ...houseData };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE company_id=? ORDER BY created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByApartmentId(apartment_id){
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE apartment_id=? ORDER BY created_at DESC',
            [apartment_id]
        );
        return rows;
    }

    static async findByFloorId(floor_id){
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE floor_id=? ORDER BY created_at DESC',
            [floor_id]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM houses ORDER BY created_at DESC'
        );
        return rows; 
    }

    static async update(id, houseData) {
        const { house_no,status } = houseData;
        await pool.execute(
            'UPDATE houses SET house_id=?,type=?, rooms=?,bathrooms=?,status=?,occupied_way=? WHERE id = ?',
            [ house_no, status, id]
        );
        return { id, ...houseData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM houses WHERE id = ?',
            [id]
        );
        return true;
    }
}

module.exports = House;


