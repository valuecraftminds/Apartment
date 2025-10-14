const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class House{
    static async create(houseData) {
    const { company_id, apartment_id, floor_id,  house_id, housetype_id } = houseData;
    const id = uuidv4().replace(/-/g, '').substring(0, 10);

    const [result] = await pool.execute(
        `INSERT INTO houses 
        (id, company_id, apartment_id, floor_id, house_id, housetype_id) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [id, company_id, apartment_id, floor_id, house_id, housetype_id]
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
            'SELECT * FROM houses WHERE company_id=? ORDER BY updated_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByApartmentAndFloor(apartment_id, floor_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM houses WHERE apartment_id=? AND floor_id=? ORDER BY created_at ASC',
        [apartment_id, floor_id]
    );
    return rows;
}

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM houses ORDER BY updated_at DESC'
        );
        return rows; 
    }

    static async update(id, houseData) {
        const { house_id,houseowner_id,housetype_id,family_id,status } = houseData;
        await pool.execute(
            'UPDATE houses SET house_id=?,houseowner_id=?,housetype_id=?,family_id=?,status=? WHERE id = ?',
            [ house_id,houseowner_id,housetype_id,family_id,status,id]
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


